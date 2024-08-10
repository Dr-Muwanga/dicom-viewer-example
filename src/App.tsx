import { useEffect, useState } from 'react'
import './App.css'
import DicomViewer from './DicomViewer'
import { IStackViewport } from '@cornerstonejs/core/dist/types/types';
import initVolume from './utils/initVolume';
import { RenderingEngine, Enums } from '@cornerstonejs/core';
import { createImageIdsAndCacheMetadata } from './utils/createImageIdsAndCacheMetadata';
import { convertMultiframeImageIds, prefetchMetadataInformation } from './utils/convertMultiframeImageIds';

const { ViewportType } = Enums;

const App =()=>{
  // const state: {
  //   element: HTMLDivElement | null;
  //   viewport: IStackViewport | null;
  //   toolGroupId: string;
  // } = {
  //   element: null,
  //   viewport: null,
  //   toolGroupId: "myToolGroup",
  // };

  // useEffect(() => {
  //   init();
  // }, []);

  // const loadAndViewImage = async()=>{
  //   const imageIds = await createImageIdsAndCacheMetadata({
  //     StudyInstanceUID:
  //       '1.3.12.2.1107.5.1.4.85529.30000024072407470459300000031',
  //     SeriesInstanceUID:
  //       '1.3.12.2.1107.5.1.4.85529.30000024072407490973400003587',
  //     orthancRoot: "http://localhost",
  //   });

  //   // await prefetchMetadataInformation(imageIds);
  //   // const stack = convertMultiframeImageIds(imageIds);

  //   state.viewport && state.viewport.setStack(imageIds).then(()=>{
  //     state.viewport && state.viewport.render();
  //   })
  // }
  
  // const init = async() =>{
  //   const content = document.getElementById("content");
  //   const isHandle = document.getElementById("cornerstone-element");
  //   if (isHandle) return;

  //   const element = document.createElement("div");
  //   element.oncontextmenu = (e) => e.preventDefault();
  //   element.id = "cornerstone-element";
  //   element.style.width = content?.offsetWidth + "px";
  //   element.style.height = content?.offsetHeight + "px";

  //   state.element = element;

  //   content && content.appendChild(element);
  //   await run()
  // }

  // const run = async() =>{
  //   await initVolume();
  //   await loadAndViewImage()

  //   // Instantiate a rendering engine
  //   const renderingEngineId = "myRenderingEngine";
  //   const renderingEngine = new RenderingEngine(renderingEngineId);

  //   // Create a stack viewport
  //   const viewportId = "CT_STACK";
  //   const viewportInput = {
  //     viewportId,
  //     type: ViewportType.STACK,
  //     element: state.element!,
  //     defaultOptions: {
  //       background: [0.2, 0, 0.2] as [number,number,number],
  //     },
  //   };

  //   renderingEngine.enableElement(viewportInput);

  //   state.viewport = renderingEngine.getStackViewports()[0];
  // }
  return (
    <DicomViewer />
    // <div id='content'></div>
  )
}

export default App
