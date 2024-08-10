import { metaData } from "@cornerstonejs/core"
import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader"
/**
 * preloads imageIds metadata in memory
 **/
async function prefetchMetadataInformation(imageIdsToPrefetch: string[]) {
  for (let i = 0; i < imageIdsToPrefetch.length; i++) {
    try {
      await cornerstoneDICOMImageLoader.wadors.loadImage(imageIdsToPrefetch[i]).promise;
    } catch (error) {
      console.error(`Error loading image ID: ${imageIdsToPrefetch[i]}`, error);
    }
  }
}

const getFrameInformation =(imageId: string)=>{
  if (imageId.includes("wadors:")) {
    const frameIndex = imageId.indexOf("/frames/")
    const imageIdFrameless =
      frameIndex > 0 ? imageId.slice(0, frameIndex + 8) : imageId
    return {
      frameIndex,
      imageIdFrameless,
    }
  } else {
    const frameIndex = imageId.indexOf("&frame=")
    let imageIdFrameless =
      frameIndex > 0 ? imageId.slice(0, frameIndex + 7) : imageId
    if (!imageIdFrameless.includes("&frame=")) {
      imageIdFrameless = imageIdFrameless + "&frame="
    }
    return {
      frameIndex,
      imageIdFrameless,
    }
  }
}
/**
 * Receives a list of imageids possibly referring to multiframe dicom images
 * and returns a list of imageid where each imageid refers to one frame.
 * For each imageId representing a multiframe image with n frames,
 * it will create n new imageids, one for each frame, and returns the new list of imageids
 * If a particular imageid no refer to a multiframe image data, it will be just copied into the new list
 * @returns new list of imageids where each imageid represents a frame
 */
function convertMultiframeImageIds(imageIds: string[]) {
  const newImageIds:string[] = []
  imageIds.forEach((imageId) => {
    const { imageIdFrameless } = getFrameInformation(imageId)
    // console.log(imageIdFrameless)
    const instanceMetaData = metaData.get("multiframeModule", imageId);
    if (
      instanceMetaData &&
      instanceMetaData.NumberOfFrames &&
      instanceMetaData.NumberOfFrames > 1
    ) {
      const NumberOfFrames = instanceMetaData.NumberOfFrames
      for (let i = 0; i < NumberOfFrames; i++) {
        const newImageId = imageIdFrameless + (i + 1)
        newImageIds.push(newImageId)
      }
    } else {
      newImageIds.push(imageId)
    }
  })
  return newImageIds
}

export { convertMultiframeImageIds, prefetchMetadataInformation }
