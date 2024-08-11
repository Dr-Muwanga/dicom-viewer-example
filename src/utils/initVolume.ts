import { init as csRenderInit } from "@cornerstonejs/core"
import { init as csToolsInit } from "@cornerstonejs/tools"
import { volumeLoader } from "@cornerstonejs/core"
import {
  cornerstoneStreamingImageVolumeLoader,
  cornerstoneStreamingDynamicImageVolumeLoader,
} from "@cornerstonejs/streaming-image-volume-loader";
import ptScalingMetaDataProvider from './ptScalingMetadatProvider';
import dicomParser from "dicom-parser"
import * as cornerstone from "@cornerstonejs/core";
import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader";
import { VolumeLoaderFn } from "@cornerstonejs/core/dist/types/types";


const { preferSizeOverAccuracy, useNorm16Texture } =
  cornerstone.getConfiguration().rendering
  const { calibratedPixelSpacingMetadataProvider } = cornerstone.utilities;

const initCornerstoneDICOMImageLoader=()=> {
  cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
  cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;
  cornerstoneDICOMImageLoader.configure({
    useWebWorkers: true,
    decodeConfig: {
      convertFloatPixelDataToInt: false,
      use16BitDataType: preferSizeOverAccuracy || useNorm16Texture,
    },
  });

  let maxWebWorkers = 1;

  if (navigator.hardwareConcurrency) {
    maxWebWorkers = Math.min(navigator.hardwareConcurrency, 7);
  }

  const config = {
    maxWebWorkers,
    startWebWorkersOnDemand: true,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: false,
        strict: false,
      },
    },
  };

  cornerstoneDICOMImageLoader.webWorkerManager.initialize(config);
};

const initProviders =()=> {
  cornerstone.metaData.addProvider(
    ptScalingMetaDataProvider.get.bind(ptScalingMetaDataProvider),
    10000
  );
  cornerstone.metaData.addProvider(
    calibratedPixelSpacingMetadataProvider.get.bind(
      calibratedPixelSpacingMetadataProvider
    ),
    11000
  );
};

const initVolumeLoader =():void =>{
  volumeLoader.registerUnknownVolumeLoader(
    cornerstoneStreamingImageVolumeLoader as unknown as VolumeLoaderFn
  )
  volumeLoader.registerVolumeLoader(
    "cornerstoneStreamingImageVolume",
    cornerstoneStreamingImageVolumeLoader  as unknown as VolumeLoaderFn
  )
  volumeLoader.registerVolumeLoader(
    "cornerstoneStreamingDynamicImageVolume",
    cornerstoneStreamingDynamicImageVolumeLoader  as unknown as VolumeLoaderFn
  )
  }

const initVolume = async() => {
  initProviders()
  await csRenderInit()
  await csToolsInit({
    touchEnabled: true,
    mouseEnabled: true,
    globalToolSyncEnabled: false,
    showSVGCursors: false,
  })
  initVolumeLoader()
  initCornerstoneDICOMImageLoader()
}

export default initVolume