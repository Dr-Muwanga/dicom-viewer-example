/* eslint-disable @typescript-eslint/no-explicit-any */
const windowWidth = 400;
const windowCenter = 40;

const lower = windowCenter - windowWidth / 2.0;
const upper = windowCenter + windowWidth / 2.0;

const ctVoiRange = { lower, upper };

export default function setCtTransferFunctionForVolumeActor({ volumeActor }: any) {
  volumeActor
    .getProperty()
    .getRGBTransferFunction(0)
    .setMappingRange(lower, upper);
}

export { ctVoiRange };