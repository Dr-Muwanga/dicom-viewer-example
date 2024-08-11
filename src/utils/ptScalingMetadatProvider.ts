/* eslint-disable @typescript-eslint/no-explicit-any */
import { utilities as csUtils } from '@cornerstonejs/core';

const scalingPerImageId: Record<string, unknown> = {};

function addInstance(imageId: string, scalingMetaData: any) {
  const imageURI = csUtils.imageIdToURI(imageId);
  scalingPerImageId[imageURI] = scalingMetaData;
}

function get(type: string, imageId: string) {
  if (type === 'scalingModule') {
    const imageURI = csUtils.imageIdToURI(imageId);
    return scalingPerImageId[imageURI];
  }
}

export default { addInstance, get };
