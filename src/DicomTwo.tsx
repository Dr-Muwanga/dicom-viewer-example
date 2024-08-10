import { useEffect, useRef } from "react";
import Hammer from "hammerjs";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import dicomLoader from "./dicom-loader";

const DicomViewer = () => {
  const dicomImageRef = useRef(null);

  useEffect(() => {
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneTools.external.Hammer = Hammer;
    dicomLoader(cornerstone);
    loadImage();
  }, []);

  const loadImage = () => {
    const element = dicomImageRef.current;

    const onImageRendered = (e) => {
      const viewport = cornerstone.getViewport(e.target);
      document.getElementById("mrbottomleft").textContent = `WW/WC: ${Math.round(viewport.voi.windowWidth)}/${Math.round(viewport.voi.windowCenter)}`;
      document.getElementById("mrbottomright").textContent = `Zoom: ${viewport.scale.toFixed(2)}`;
    };

    element.addEventListener("cornerstoneimagerendered", onImageRendered);
    const config = {
      minScale: 0.25,
      maxScale: 20.0,
      preventZoomOutsideImage: true,
    };
    cornerstoneTools.zoom.setConfiguration(config);
    // document.getElementById("chkshadow").addEventListener("change", function () {
    //   cornerstoneTools.length.setConfiguration({ shadow: this.checked });
    //   cornerstoneTools.angle.setConfiguration({ shadow: this.checked });
    //   cornerstone.updateImage(element);
    // });
    
    const imageId = "example://1";
    cornerstone.enable(element);
    cornerstone.loadImage(imageId).then((image) => {
      cornerstone.displayImage(element, image);
      cornerstoneTools.mouseInput.enable(element);
      cornerstoneTools.mouseWheelInput.enable(element);
      cornerstoneTools.wwwc.activate(element, 1);
      cornerstoneTools.pan.activate(element, 2);
      cornerstoneTools.zoom.activate(element, 4);
      cornerstoneTools.zoomWheel.activate(element);
      cornerstoneTools.probe.enable(element);
      cornerstoneTools.length.enable(element);
      cornerstoneTools.ellipticalRoi.enable(element);
      cornerstoneTools.rectangleRoi.enable(element);
      cornerstoneTools.angle.enable(element);
      cornerstoneTools.highlight.enable(element);
    });
  };

  const enableTool = (toolName, mouseButtonNumber) => {
    disableAllTools();
    cornerstoneTools[toolName].activate(dicomImageRef.current, mouseButtonNumber);
  };

  const disableAllTools = () => {
    cornerstoneTools.wwwc.disable(dicomImageRef.current);
    cornerstoneTools.pan.activate(dicomImageRef.current, 2);
    cornerstoneTools.zoom.activate(dicomImageRef.current, 4);
    cornerstoneTools.probe.deactivate(dicomImageRef.current, 1);
    cornerstoneTools.length.deactivate(dicomImageRef.current, 1);
    cornerstoneTools.ellipticalRoi.deactivate(dicomImageRef.current, 1);
    cornerstoneTools.rectangleRoi.deactivate(dicomImageRef.current, 1);
    cornerstoneTools.angle.deactivate(dicomImageRef.current, 1);
    cornerstoneTools.highlight.deactivate(dicomImageRef.current, 1);
    cornerstoneTools.freehand.deactivate(dicomImageRef.current, 1);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>React Cornerstone DICOM Viewer</h1>
      </div>
      <br />
      <div className="row">
        <div className="col-3">
          <ul className="list-group">
            <button onClick={() => enableTool("wwwc", 1)} className="list-group-item">WW/WC</button>
            <button onClick={() => enableTool("pan", 3)} className="list-group-item">Pan</button>
            <button onClick={() => enableTool("zoom", 5)} className="list-group-item">Zoom</button>
            <button onClick={() => enableTool("length", 1)} className="list-group-item">Length</button>
            <button onClick={() => enableTool("probe", 1)} className="list-group-item">Probe</button>
            <button onClick={() => enableTool("ellipticalRoi", 1)} className="list-group-item">Elliptical ROI</button>
            <button onClick={() => enableTool("rectangleRoi", 1)} className="list-group-item">Rectangle ROI</button>
            <button onClick={() => enableTool("angle", 1)} className="list-group-item">Angle</button>
            <button onClick={() => enableTool("highlight", 1)} className="list-group-item">Highlight</button>
            <button onClick={() => enableTool("freehand", 1)} className="list-group-item">Freeform ROI</button>
          </ul>
          <div className="checkbox">
            <label htmlFor="chkshadow">
              <input type="checkbox" id="chkshadow" />Apply shadow
            </label>
          </div>
          <br />
        </div>
        <div className="col-9">
          <div
            style={{
              width: 512,
              height: 512,
              position: "relative",
              display: "inline-block",
              color: "white",
            }}
            onContextMenu={() => false}
            className="cornerstone-enabled-image"
            unselectable="on"
            onSelectStart={() => false}
            onMouseDown={() => false}
          >
            <div
              ref={dicomImageRef}
              style={{
                width: 512,
                height: 512,
                top: 0,
                left: 0,
                position: "absolute",
              }}
            />
            <div id="mrtopleft" style={{ position: "absolute", top: 3, left: 3 }}>Patient Name</div>
            <div id="mrtopright" style={{ position: "absolute", top: 3, right: 3 }}>Hospital</div>
            <div id="mrbottomright" style={{ position: "absolute", bottom: 3, right: 3 }}>Zoom:</div>
            <div id="mrbottomleft" style={{ position: "absolute", bottom: 3, left: 3 }}>WW/WC:</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DicomViewer;