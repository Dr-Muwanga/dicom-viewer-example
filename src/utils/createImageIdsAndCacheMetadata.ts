import { api } from "dicomweb-client";
import dcmjs from "dcmjs";
import { Types, utilities } from "@cornerstonejs/core";
import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader";
import getPTImageIdInstanceMetadata from "./getPTImageIdInstanceMetadata";
import { calculateSUVScalingFactors, InstanceMetadata } from "@cornerstonejs/calculate-suv";
import ptScalingMetaDataProvider from './ptScalingMetadatProvider';
import { convertMultiframeImageIds, prefetchMetadataInformation } from "./convertMultiframeImageIds";
import removeInvalidTags from "./removeInvalidTags";
import getPixelSpacingInformation from "./getPixelSpacingInfo";

const { DicomMetaDictionary } = dcmjs.data
const { calibratedPixelSpacingMetadataProvider } = utilities

type Props = {
    StudyInstanceUID: string;
    SeriesInstanceUID: string;
    SOPInstanceUID?: string | null;
    orthancRoot: string;
}
export const createImageIdsAndCacheMetadata = async ({
  StudyInstanceUID,
  SeriesInstanceUID,
  SOPInstanceUID = null,
  orthancRoot,
}: Props) => {
  const SOP_INSTANCE_UID = "00080018";
  const SERIES_INSTANCE_UID = "0020000E";
  const MODALITY = "00080060";

  const studySearchOptions = {
    studyInstanceUID: StudyInstanceUID,
    seriesInstanceUID: SeriesInstanceUID,
  };

  const client = new api.DICOMwebClient({ url: orthancRoot as string, singlepart: true, headers: {
    'Accept': 'application/dicom+json, multipart/related',
    'Content-Type': 'application/dicom'
  }});

  const instances = await client.retrieveSeriesMetadata(studySearchOptions);
  const modality = instances[0][MODALITY] && Array.isArray(instances[0][MODALITY].Value) ? instances[0][MODALITY].Value[0] : undefined;

  let imageIds = instances.map((instanceMetaData) => {
    const SeriesInstanceUID = 
      instanceMetaData[SERIES_INSTANCE_UID]?.Value && instanceMetaData[SERIES_INSTANCE_UID].Value[0];
    const SOPInstanceUIDToUse =
      SOPInstanceUID || instanceMetaData[SOP_INSTANCE_UID]?.Value && instanceMetaData[SOP_INSTANCE_UID].Value[0];

    const prefix = "wadors:";

    const imageId = 
      prefix +
      orthancRoot +
      "/studies/" +
      StudyInstanceUID +
      "/series/" +
      SeriesInstanceUID +
      "/instances/" +
      SOPInstanceUIDToUse +
      "/frames/1";

      cornerstoneDICOMImageLoader.wadors.metaDataManager.add(
      imageId,
      instanceMetaData
    );
    return imageId;
  });
  
  await prefetchMetadataInformation(imageIds);
  imageIds = convertMultiframeImageIds(imageIds);
  
  imageIds.forEach((imageId) => {
    let instanceMetaData =
      cornerstoneDICOMImageLoader.wadors.metaDataManager.get(imageId)

      // It was using JSON.parse(JSON.stringify(...)) before but it is 8x slower
      instanceMetaData = removeInvalidTags(instanceMetaData)
      
      if (instanceMetaData) {
        // Add calibrated pixel spacing
        const metadata = DicomMetaDictionary.naturalizeDataset(instanceMetaData)
        const pixelSpacing = getPixelSpacingInformation(metadata)

      if (pixelSpacing) {
        calibratedPixelSpacingMetadataProvider.add(imageId, {
          rowPixelSpacing: parseFloat(pixelSpacing[0]),
          columnPixelSpacing: parseFloat(pixelSpacing[1]),
        } as Types.IImageCalibration)
      }
    }
  })

  if(modality === 'PT') {
    const InstanceMetadataArray:InstanceMetadata[] = []

    imageIds.forEach((imageId)=>{
      const instanceMetadata = getPTImageIdInstanceMetadata(imageId);

      if (typeof instanceMetadata.CorrectedImage === "string") {
        instanceMetadata.CorrectedImage =
          instanceMetadata.CorrectedImage.split("\\")
      }

      if (instanceMetadata) {
        InstanceMetadataArray.push(instanceMetadata)
      }
    });

    if (InstanceMetadataArray.length) {
      try {
        const suvScalingFactors = calculateSUVScalingFactors(
          InstanceMetadataArray
        )
        InstanceMetadataArray.forEach((_, index) => {
          ptScalingMetaDataProvider.addInstance(
            imageIds[index],
            suvScalingFactors[index]
          )
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  return imageIds;
};
