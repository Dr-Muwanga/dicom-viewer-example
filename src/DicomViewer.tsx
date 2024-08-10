import { useEffect, useRef } from "react";
import { RenderingEngine, Enums, StackViewport } from "@cornerstonejs/core";
import * as cornerstoneTools from "@cornerstonejs/tools";
import { createImageIdsAndCacheMetadata } from "./utils/createImageIdsAndCacheMetadata";
import initVolume from "./utils/initVolume";

const {
  PanTool,
  WindowLevelTool,
  StackScrollMouseWheelTool,
  ZoomTool,
  EllipticalROITool,
  RectangleROITool,
  ProbeTool,
  PlanarFreehandROITool,
  LengthTool,
  AngleTool,
  ArrowAnnotateTool,
  ToolGroupManager,
  Enums: csToolsEnums,
} = cornerstoneTools;

const toolNames = [
  WindowLevelTool.toolName,
  PanTool.toolName,
  ZoomTool.toolName,
  EllipticalROITool.toolName,
  RectangleROITool.toolName,
  PlanarFreehandROITool.toolName,
  ProbeTool.toolName,
  LengthTool.toolName,
  AngleTool.toolName,
  ArrowAnnotateTool.toolName,
];

let selectedToolName = toolNames[8];

const toolGroupId = "myToolGroupId";
cornerstoneTools.addTool(PanTool);
cornerstoneTools.addTool(WindowLevelTool);
cornerstoneTools.addTool(StackScrollMouseWheelTool);
cornerstoneTools.addTool(ZoomTool);
cornerstoneTools.addTool(EllipticalROITool);
cornerstoneTools.addTool(RectangleROITool);
cornerstoneTools.addTool(PlanarFreehandROITool);
cornerstoneTools.addTool(ProbeTool);
cornerstoneTools.addTool(LengthTool);
cornerstoneTools.addTool(AngleTool);
cornerstoneTools.addTool(ArrowAnnotateTool);

const toolGroup = ToolGroupManager.createToolGroup(toolGroupId)!;

toolGroup.addTool(PanTool.toolName);
toolGroup.addTool(WindowLevelTool.toolName);
toolGroup.addTool(StackScrollMouseWheelTool.toolName);
toolGroup.addTool(ZoomTool.toolName);
toolGroup.addTool(EllipticalROITool.toolName);
toolGroup.addTool(RectangleROITool.toolName);
toolGroup.addTool(PlanarFreehandROITool.toolName);
toolGroup.addTool(ProbeTool.toolName);
toolGroup.addTool(LengthTool.toolName);
toolGroup.addTool(AngleTool.toolName);
toolGroup.addTool(ArrowAnnotateTool.toolName);

toolGroup.setToolActive(selectedToolName, {
  bindings: [
    {
      mouseButton: csToolsEnums.MouseBindings.Primary, // Left Click
    },
  ],
});

toolGroup.setToolActive(PanTool.toolName, {
  bindings: [
    {
      mouseButton: csToolsEnums.MouseBindings.Auxiliary, // Middle Click
    },
  ],
});
toolGroup.setToolActive(ZoomTool.toolName, {
  bindings: [
    {
      mouseButton: csToolsEnums.MouseBindings.Secondary, // Right Click
    },
  ],
});

toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);

toolGroup.setToolPassive(ProbeTool.toolName);
toolGroup.setToolPassive(RectangleROITool.toolName);
toolGroup.setToolPassive(EllipticalROITool.toolName);
toolGroup.setToolPassive(AngleTool.toolName);
toolGroup.setToolPassive(ArrowAnnotateTool.toolName);
toolGroup.setToolPassive(PlanarFreehandROITool.toolName);
toolGroup.setToolConfiguration(PlanarFreehandROITool.toolName, {
  calculateStats: true,
});

const DicomViewer = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewPortRef = useRef<StackViewport | null>(null);

  const fetchData = async (container: HTMLDivElement) => {
    try {
      await initVolume();

      const imageIds = await createImageIdsAndCacheMetadata({
        StudyInstanceUID:
          "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
        SeriesInstanceUID:
          "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
        orthancRoot: "https://d3t6nz73ql33tx.cloudfront.net/dicomweb",
      });

      const renderingEngineId = "myRenderingEngine";
      const renderingEngine = new RenderingEngine(renderingEngineId);

      const viewportId = "CT_STACK";
      const viewportInput = {
        viewportId,
        type: Enums.ViewportType.STACK,
        element: container!,
        defaultOptions: {
          orientation: Enums.OrientationAxis.AXIAL,
          background: [0.2, 0.2, 0.2] as [number, number, number]
        },
      };

      renderingEngine.enableElement(viewportInput);
      
      const viewport = renderingEngine.getStackViewports()[0];
      viewPortRef.current = viewport;
      viewport.setStack(imageIds).then(() => {
        viewport.render();
      });

  toolGroup.addViewport(viewportId, renderingEngineId);
    } catch (error) {
      console.log("error loading dicom");
      console.log(error);
    }
  };

  const selectTool = (toolName: string) => {
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    toolGroup?.setToolActive(toolName, {
      bindings: [
        {
          mouseButton: csToolsEnums.MouseBindings.Primary, // Left Click
        },
      ],
    });

    toolGroup?.setToolPassive(selectedToolName);
    selectedToolName = toolName;
  };

  const cancelToolDrawing = (evt: CustomEvent) => {
    const { element, key } = evt.detail;
    if (key === "Escape") {
      cornerstoneTools.cancelActiveManipulations(element);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    fetchData(container);
    container?.addEventListener(csToolsEnums.Events.KEY_DOWN, (evt) => {
      console.log(evt);
      cancelToolDrawing(evt);
    });

    return () => {
      cornerstoneTools.removeTool(PanTool);
      cornerstoneTools.removeTool(WindowLevelTool);
      cornerstoneTools.removeTool(StackScrollMouseWheelTool);
      cornerstoneTools.removeTool(ZoomTool);
      cornerstoneTools.removeTool(EllipticalROITool);
      cornerstoneTools.removeTool(RectangleROITool);
      cornerstoneTools.removeTool(PlanarFreehandROITool);
      cornerstoneTools.removeTool(ProbeTool);
      cornerstoneTools.removeTool(LengthTool);
      cornerstoneTools.removeTool(AngleTool);
    };
  }, [containerRef]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        ref={containerRef}
        style={{
          height: "500px",
          width: "500px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          border: "1px solid black",
          position: "relative",
          color: "#FFF",
        }}
      >
      </div>

      <ul
        style={{
          display: "flex",
          flexWrap: "wrap",
          flexGrow: "inherit",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <button
          style={{
            backgroundColor: "blue",
            color: "#fff",
            fontSize: "15px",
            padding: "8px",
            width: "120px",
            height: "60px",
          }}
          onClick={() => selectTool(toolNames[0])}
        >
          Windowing
        </button>
        <button
          style={{
            backgroundColor: "blue",
            color: "#fff",
            fontSize: "15px",
            padding: "8px",
            width: "120px",
            height: "60px",
          }}
          onClick={() => selectTool(toolNames[1])}
        >
          Pan
        </button>
        <button
          style={{
            backgroundColor: "blue",
            color: "#fff",
            fontSize: "15px",
            padding: "8px",
            width: "120px",
            height: "60px",
          }}
          onClick={() => selectTool(toolNames[2])}
        >
          Zoom
        </button>
        <button
          style={{
            backgroundColor: "blue",
            color: "#fff",
            fontSize: "15px",
            padding: "8px",
            width: "120px",
            height: "60px",
          }}
          onClick={() => selectTool(toolNames[3])}
        >
          Ellipsis
        </button>
        <button
          style={{
            backgroundColor: "blue",
            color: "#fff",
            fontSize: "15px",
            padding: "8px",
            width: "120px",
            height: "60px",
          }}
          onClick={() => selectTool(toolNames[4])}
        >
          Rectangle
        </button>
        <button
          style={{
            backgroundColor: "blue",
            color: "#fff",
            fontSize: "15px",
            padding: "8px",
            width: "120px",
            height: "60px",
          }}
          onClick={() => selectTool(toolNames[5])}
        >
          Freehand
        </button>
        <button
          style={{
            backgroundColor: "blue",
            color: "#fff",
            fontSize: "15px",
            padding: "8px",
            width: "120px",
            height: "60px",
          }}
          onClick={() => selectTool(toolNames[6])}
        >
          Probe
        </button>
        <button
          style={{
            backgroundColor: "blue",
            color: "#fff",
            fontSize: "15px",
            padding: "8px",
            width: "120px",
            height: "60px",
          }}
          onClick={() => selectTool(toolNames[7])}
        >
          Length
        </button>
        <button
          style={{
            backgroundColor: "blue",
            color: "#fff",
            fontSize: "15px",
            padding: "8px",
            width: "120px",
            height: "60px",
          }}
          onClick={() => selectTool(toolNames[8])}
        >
          Angle
        </button>
        <button
          style={{
            backgroundColor: "blue",
            color: "#fff",
            fontSize: "15px",
            padding: "8px",
            width: "120px",
            height: "60px",
          }}
          onClick={() => selectTool(toolNames[9])}
        >
          Arrow
        </button>

        <button
          style={{
            backgroundColor: "blue",
            color: "#fff",
            fontSize: "15px",
            padding: "8px",
            width: "120px",
            height: "60px",
          }}
          onClick={() => {
            if (viewPortRef.current) {
              const { invert } = viewPortRef.current.getProperties();
              viewPortRef.current.setProperties({ invert: !invert });
              viewPortRef.current.render();
            }
          }}
        >
          Invert
        </button>
        <button
          style={{
            backgroundColor: "blue",
            color: "#fff",
            fontSize: "15px",
            padding: "8px",
            width: "120px",
            height: "60px",
          }}
          onClick={() => {
            if (viewPortRef.current) {
              viewPortRef.current.setProperties({ colormap: { name: "hsv" } });
              viewPortRef.current.render();
            }
          }}
        >
          ColorMap
        </button>
        <button
          style={{
            backgroundColor: "blue",
            color: "#fff",
            fontSize: "15px",
            padding: "8px",
            width: "120px",
            height: "60px",
          }}
          onClick={() => {
            if (viewPortRef.current) {
              viewPortRef.current.resetCamera()
              viewPortRef.current.resetProperties();
              viewPortRef.current.render();
            }
          }}
        >
          Reset
        </button>
      </ul>
    </div>
  );
};

export default DicomViewer;
