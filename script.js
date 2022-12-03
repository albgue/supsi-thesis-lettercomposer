var canvas = new fabric.Canvas("myCanvas");
var ctx = canvas.getContext("2d");
var contextLines = canvas.getContext("2d");
var container = document.getElementById("container");
var containerCanvas = document.getElementById("canvas_container");
canvas.backgroundColor = "#999999";

var drawSessionList = [];
canvas.freeDrawingBrush.color = "black";

// ==========================================
// INIT
// ==========================================

resizeCanvas();

this.box1 = new fabric.Rect({
  width: 200,
  height: 100,
  top: 70,
  left: 120,
  fill: "green",
  myType: "box",
  borderColor: "red",
  cornerColor: "red",
  cornerSize: 50,
  transparentCorners: false,
  centeredRotation: true,
  centeredScaling: true,
  originX: "center",
  originY: "center",
  minScaleLimit: 0.4,
  //lockUniScaling: true
  //snapAngle: 45,
  snapThreshold: 10,
  lockRotation: false,
  lockDegree: null,
});

this.box2 = new fabric.Rect({
  width: 100,
  height: 200,
  top: 200,
  left: 120,
  fill: "green",
  myType: "box",
  borderColor: "red",
  cornerColor: "red",
  cornerSize: 10,
  transparentCorners: false,
  centeredRotation: true,
  centeredScaling: true,
  originX: "center",
  originY: "center",
  minScaleLimit: 0.4,
  //lockUniScaling: true
  //snapAngle: 45,
  snapThreshold: 10,
  lockRotation: false,
  lockDegree: null,
});

this.box3 = new fabric.Rect({
  width: 500,
  height: 100,
  top: 20,
  left: 400,
  fill: "yellow",
  myType: "box",
  borderColor: "red",
  cornerColor: "red",
  cornerSize: 10,
  transparentCorners: false,
  centeredRotation: true,
  centeredScaling: true,
  originX: "center",
  originY: "center",
  minScaleLimit: 0.4,
  //lockUniScaling: true
  //snapAngle: 45,
  snapThreshold: 10,
  lockRotation: false,
  lockDegree: null,
});

//canvas.add(this.box);

centerObjects();

document.getElementById("toggleDraw").addEventListener(
  "click",
  () => {
    this.toggleDraw();
  },
  false
);

// =======================================================

let pausePanning = false;

let lastX = null;
let lastY = null;

let adjustDeltaX = 0;
let adjustDeltaY = 0;
let adjustScale = 1;
let adjustScaleX = 1;
let adjustScaleY = 1;
let adjustRotation = 0;

let currentDeltaX = null;
let currentDeltaY = null;
let currentScale = null;
let currentScaleX = null;
let currentScaleY = null;
let currentRotation = null;

var ctx = canvas.getSelectionContext();
var contextLines = canvas.getSelectionContext();
var centerLineMargin = 4;
var centerLineColor = "red";
var centerLineWidth = 1;

var rotateSnaps = [0, 45, 90, 135, 180, 225, 270, 315, 360];

let hammer = new Hammer.Manager(canvas.upperCanvasEl);
let pan = new Hammer.Pan();
let rotate = new Hammer.Rotate();
let pinch = new Hammer.Pinch();

hammer.add([pan, pinch, rotate]);
hammer.get("pinch").set({ enable: true });
hammer.get("rotate").set({ enable: true });
hammer.get("pan").set({ enable: true });

hammer.on("panstart pinchstart rotatestart", (e) => {
  adjustRotation -= e.rotation;
  this.lastX = e.center.x;
  this.lastY = e.center.y;

  if (canvas.getActiveObject()) {
    var object = canvas.getActiveObject();
    this.adjustScaleX = object.scaleX;
    this.adjustScaleY = object.scaleY;
  }
});

hammer.on("panmove", (e) => {
  if (
    canvas.getActiveObject() == undefined &&
    this.pausePanning == false &&
    canvas.isDrawingMode == 0 &&
    e.maxPointers == 1
  ) {
    currentDeltaX = -(this.lastX - e.center.x);
    currentDeltaY = -(this.lastY - e.center.y);
    let delta = new fabric.Point(currentDeltaX, currentDeltaY);

    canvas.relativePan(delta);
    canvas.renderAll();

    this.lastX = e.center.x;
    this.lastY = e.center.y;
  }
});

canvas.on("object:rotating", function (e) {
  if (rotateSnaps.includes(Math.abs(Math.ceil(e.target.angle)))) {
    //e.target.lockRotation = true
    e.target.lockedDegree = Math.ceil(e.target.angle);
  } else {
    //e.target.lockRotation = false
    e.target.lockedDegree = null;
  }

  adjustRotation = e.target.angle;
  /*if(canvas.getActiveObject()) {       
             var object = canvas.getActiveObject()
             object.adjustRotation = e.target.angle
     }*/
  drawRotateGuidelines(canvas.getActiveObject(), e.target.angle);
});

//function drawRotateGuidelines(x1, y1, x2, y2, newDegree, objectCoords) {
function drawRotateGuidelines(object) {
  contextLines.clearRect(0, 0, canvas.width, canvas.height);

  if (rotateSnaps.includes(Math.abs(Math.ceil(object.angle)))) {
    //console.log("drawing rotate guideline")
    // console.log("x1, y1, x2, y2: " + x1 + ", " + y1 + ", " + x2 + ", " + y2)

    //var XYstart = fabric.util.transformPoint(new fabric.Point(x1, y1), canvas.viewportTransform)
    //var XYend = fabric.util.transformPoint(new fabric.Point(x2, y2),canvas.viewportTransform)
    //console.log(JSON.stringify(objectCoords))
    var scale = object.scaleX;
    var XYstart = fabric.util.transformPoint(
      new fabric.Point(object.left - (object.width * scale) / 2, object.top),
      canvas.viewportTransform
    );
    cp = object.getCenterPoint();
    //console.log("cp.x: " + cp.x * scale)
    var XYmid = fabric.util.transformPoint(
      new fabric.Point(cp.x, cp.y),
      canvas.viewportTransform
    );
    var XYend = fabric.util.transformPoint(
      new fabric.Point(object.left + (object.width * scale) / 2, object.top),
      canvas.viewportTransform
    );

    contextLines.save();

    middlePoint = { x: XYmid.x, y: XYmid.y };
    contextLines.translate(middlePoint.x, middlePoint.y);
    contextLines.rotate((Math.PI / 180) * object.angle);
    contextLines.translate(-middlePoint.x, -middlePoint.y);
    contextLines.strokeStyle = centerLineColor;
    contextLines.lineWidth = centerLineWidth;
    contextLines.beginPath();
    //console.log("centerLineColor: " + centerLineColor)
    contextLines.moveTo(XYstart.x, XYstart.y);

    contextLines.lineTo(XYend.x, XYend.y);

    contextLines.stroke();
    contextLines.restore();

    XYstart = fabric.util.transformPoint(
      new fabric.Point(object.left - (object.height * scale) / 2, object.top),
      canvas.viewportTransform
    );
    XYend = fabric.util.transformPoint(
      new fabric.Point(object.left + (object.height * scale) / 2, object.top),
      canvas.viewportTransform
    );
    contextLines.save();

    middlePoint = { x: XYmid.x, y: XYmid.y };
    contextLines.translate(middlePoint.x, middlePoint.y);
    contextLines.rotate((Math.PI / 180) * (object.angle + 90));
    contextLines.translate(-middlePoint.x, -middlePoint.y);
    contextLines.strokeStyle = centerLineColor;
    contextLines.lineWidth = centerLineWidth;
    contextLines.beginPath();
    //console.log("centerLineColor: " + centerLineColor)
    contextLines.moveTo(XYstart.x, XYstart.y);

    contextLines.lineTo(XYend.x, XYend.y);

    contextLines.stroke();
    contextLines.restore();

    canvas.renderAll();
  }
}

function checkRotateSnap(degree, object) {
  //var degreeSnapTo45 = (Math.ceil( degree / 45)) * 45
  //console.log("degree: " + degree)
  //console.log("degreeSnapTo45: " + degreeSnapTo45)
  //console.log("Math.abs(Math.ceil(degree): " + Math.abs(Math.ceil(degree)))
  //console.log("Math.ceil(degree): " + Math.ceil(degree))

  // console.log("degree + adjustRotation: " + (degree + adjustRotation))
  var inDegree = degree + adjustRotation;
  //console.log("inDegree: " + inDegree)

  var newDegree = null;
  //checkDegree = degree
  //checkDegree = Math.abs(1)
  //numState = Math.sign(degree)

  //console.log("locked: " + locked)

  /*
    if (lockRotation == true) {
            if (between(Math.abs(Math.ceil(degree)), degreeSnapTo45-5, degreeSnapTo45+5)) {
                
                console.log("111 - maintain snap")
                lockRotation = true
                newDegree = degreeSnapTo45// + adjustRotation        
            } else {
                
                console.log("222 - exit snap")
                lockRotation = false
                newDegree = degree + adjustRotation
            }
        
            
    } else {
        
        
        
         if (degree == degreeSnapTo45) {
              
                console.log("333 - enter snap")
                lockRotation = true
                newDegree = degree // + adjustRotation

                drawRotateGuideline(0, canvas.getHeight() / 2 + 0.5, canvas.getWidth(), canvas.getHeight() / 2 + 0.5)
            } else {
                
                console.log("444 - no snap")
                lockRotation = false
                newDegree = degree + adjustRotation
            }
    }
    */

  if (object.lockRotation == true) {
    //console.log("---- LOCKED ------------------------")
    //for(var snap of snaps){

    if (
      between(
        Math.abs(Math.ceil(inDegree)),
        Math.abs(object.lockedDegree) - 10,
        Math.abs(object.lockedDegree) + 10
      )
    ) {
      //console.log("111 - maintain snap")
      object.lockRotation = true;
      newDegree = object.lockedDegree;
      //newDegree = degree

      // break
    } else {
      //console.log("222 - exit snap")
      object.lockRotation = false;
      object.lockedDegree = null;
      newDegree = degree + adjustRotation;
      contextLines.clearRect(0, 0, canvas.width, canvas.height);
      // break
    }
    // }
  } else {
    // for(var snap of snaps){

    //console.log("Math.abs(Math.ceil(inDegree)): " + Math.abs(Math.ceil(inDegree)))

    // if (Math.abs(Math.ceil(inDegree)) == snap) {
    if (rotateSnaps.includes(Math.abs(Math.ceil(inDegree)))) {
      // console.log("------------------------------ ENTER LOCK ------------------------------")

      //console.log("objectAngle: " + objectAngle)
      //console.log("Math.abs(Math.ceil(objectAngle)): " + Math.abs(Math.ceil(objectAngle)))
      //console.log("333 - enter snap")
      object.lockRotation = true;

      //console.log("Math.abs(Math.ceil(degree): " + (Math.ceil(degree)))
      newDegree = Math.ceil(degree + adjustRotation);

      object.lockedDegree = newDegree;
      //drawRotateGuideline(0, canvas.getHeight() / 2 + 0.5, canvas.getWidth(), canvas.getHeight() / 2 + 0.5, newDegree)
      //console.log("objectCoords.left 333: " + objectCoords.left)
      // drawRotateGuideline(0, canvas.getHeight() / 2 + 0.5, canvas.getWidth(), canvas.getHeight() / 2 + 0.5, newDegree, objectCoords)

      //break
    } else {
      // console.log("444 - no snap")
      object.lockRotation = false;
      object.lockedDegree = null;
      newDegree = degree + adjustRotation;
      contextLines.clearRect(0, 0, canvas.width, canvas.height);

      //break
    }
    //}
  }

  /*
    for(var snap of snaps){
       if (between(Math.abs(degree), snap-5, snap+5)) {
        newDegree = snap
        lockRotation = true
        //newDegree = Math.abs(numState);
        console.log("degree hits snap: " + newDegree)
         //console.log("Math.abs(degree): " + Math.abs(degree))

        drawRotateGuideline(0, canvas.getHeight() / 2 + 0.5, canvas.getWidth(), canvas.getHeight() / 2 + 0.5)


        break
      } else {

         lockRotation = false
        newDegree = degree
      }
    }
    */

  //if(Math.abs(angle - locked) < 10 || Math.abs(locked - angle) < 10) {
  //	newDegree = locked;
  // }
  //canvas.renderAll()

  //console.log("newDegree: " + newDegree)
  //console.log("000000000000000000000000000000000000000")

  update_info();
  return newDegree;
}

hammer.on("pinchmove rotatemove", (e) => {
  if (canvas.getActiveObject() && e.maxPointers == 2) {
    this.pausePanning = true;
    var object = canvas.getActiveObject();

    // -----------------------------------
    // ROTATION
    // -----------------------------------

    //console.log(JSON.stringify(e))

    // Exceeds 360
    //console.log("adjustRotation: " + adjustRotation)

    // Absolute; goes from -360 to 360 depending on start point and clock direction
    //console.log("e.rotation: " + e.rotation)

    // Strange behaviour, and relative
    //console.log("e.angle: " + e.angle)

    // console.log("object: " + JSON.stringify(object, null, 4))

    //console.log("object.angle: " + object.angle)

    // Normal, no-snap rotation
    // this.currentRotation = adjustRotation + e.rotation
    //this.currentRotation = object.adjustRotation + e.rotation

    //  console.log(" object.left: " +  object.left)
    //var objectCoords = {left: object.left, top: object.top, width: object.width, height: object.height}
    this.currentRotation = checkRotateSnap(e.rotation, object);

    //console.log("this.currentRotation: " + this.currentRotation)

    if (this.currentRotation != null) {
      object.rotate(this.currentRotation);
    }

    // -----------------------------------
    // SCALING
    // -----------------------------------

    currentScale = adjustScale * e.scale;
    currentScaleX = adjustScaleX * e.scale * 1;
    currentScaleY = adjustScaleY * e.scale * 1;

    // Blocks object from being resized too small (and maintains aspect ratio)
    if (
      currentScaleX > object.minScaleLimit &&
      currentScaleY > object.minScaleLimit
    ) {
    } else {
      // console.log("object has reached a limit")
      currentScaleX = object.scaleX; //Math.max(currentScaleX, object.minScaleLimit)
      currentScaleY = object.scaleY; //Math.max(currentScaleY, object.minScaleLimit)
    }

    this.pausePanning = true;

    let deltaScaleX = currentScaleX;
    let deltaScaleY = currentScaleY;

    // Temporarily locking regular object dragging during the gesture, just to smooth out jitteryness
    object.set({ lockMovementX: true, lockMovementY: true });

    object.set("scaleX", deltaScaleX);
    object.set("scaleY", deltaScaleY);

    object.setCoords();

    canvas.renderAll();

    if (object.lockRotation == true) {
      drawRotateGuidelines(object);
    }

    object.setCoords();

    canvas.renderAll();
  }
});

hammer.on("panend pinchend rotateend", (e) => {
  this.pausePanning = false;

  contextLines.clearRect(0, 0, canvas.width, canvas.height);

  if (canvas.getActiveObject()) {
    var object = canvas.getActiveObject();

    this.adjustScale = this.currentScale;
    adjustRotation = this.currentRotation;
    this.adjustDeltaX = this.currentDeltaX;
    this.adjustDeltaY = this.currentDeltaY;
    this.adjustScaleX = this.currentScaleX;
    this.adjustScaleY = this.currentScaleY;

    //object.lockRotation = false

    // Timeout is to smooth out jitteryness, especially on iOS (iPad)
    setTimeout(function () {
      object.set({
        lockRotation: false,
        lockMovementX: false,
        lockMovementY: false,
      });
    }, 300);
  }

  canvas.renderAll();
});

canvas.on({
  "object:added": (event) => {
    //console.log("object: added event: " + JSON.stringify(event, null, 4))
    // console.log("object: added event: " + JSON.stringify(event, null, 4))

    let target = event.target;
    //console.log("event.target.type: " + event.target.type)
    //console.log("event.target.type11: " + event.target.type)
    if (event.target.type != "path") {
      event.target.set({
        snapAngle: 45,
        snapThreshold: 10,
        originX: "center",
        originY: "center",
      });
    }

    if (event.target.type === "group") {
      console.log("event.target.type22: " + event.target.type);
      target.set({
        snapAngle: 45,
        snapThreshold: 10,
        top: target.top + target.height / 2 + target.strokeWidth / 2,
        left: target.left + target.width / 2 + target.strokeWidth / 2,
        originX: "center",
        originY: "center",
      });
      //console.log("event.target: " + target)
    }

    if (canvas.isDrawingMode == 1 && event.target.stroke != undefined) {
      this.drawSessionList.push(event.target);
      //fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
    }

    if (canvas.isDrawingMode == 0) {
      //fabric.Object.prototype.originX = 'left'
      //fabric.Object.prototype.originY = 'top';
    }
  },
});

// ===================================================
// FUNCTIONS
// ===================================================

function resizeCanvas() {
  let canvasContainer = document.getElementById("canvas_container");
  let containerWidth = canvasContainer.offsetWidth;
  let containerHeight = canvasContainer.offsetHeight;
  centerObjects();
  canvas.setWidth(containerWidth);
  canvas.setHeight(containerHeight);
  canvas.renderAll();
}

function centerObjects() {
  let objects = canvas.getObjects();
  let selection = new fabric.ActiveSelection(objects, { canvas: canvas });
  selection.center();
  selection.destroy();
}

function between(value, first, last) {
  let lower = Math.min(first, last),
    upper = Math.max(first, last);
  return value >= lower && value <= upper;
}

function CustomRotateFunc(object, angle, x, y) {
  //_rotateObject: function (x, y) {

  //let t = this._currentTransform
  let t = object;
  //let x = object.left
  //let y = object.top
  //let target = t.target

  // console.log("x: " + x)
  // console.log("y: " + y)
  console.log("object: " + JSON.stringify(object, null, 4));
  //let constraintPosition = target.translateToOriginPoint(target.getCenterPoint(), t.originX, t.originY)

  /*if (target.lockRotation) {
    return false;
  }*/
  let atan2 = Math.atan2;
  //let lastAngle = atan2(t.ey - constraintPosition.y, t.ex - constraintPosition.x)
  //let curAngle = atan2(y - constraintPosition.y, x - constraintPosition.x)
  let lastAngle = atan2(t.left, t.top);
  let curAngle = atan2(y, x);

  console.log("lastAngle: " + lastAngle);
  console.log("curAngle: " + curAngle);
  // let angle2 = radiansToDegrees(curAngle - lastAngle + t.theta)
  let angle2 = (curAngle - lastAngle + t.theta) / Math.PI / 180;
  let hasRotated = true;
  console.log("angle2: " + angle2);

  //if (t.snapAngle > 0) {
  //let snapAngle = t.snapAngle
  let snapAngle = 45;
  //let snapThreshold = t.snapThreshold || snapAngle
  let snapThreshold = 10;
  let rightAngleLocked = Math.ceil(angle2 / snapAngle) * snapAngle;
  let leftAngleLocked = Math.floor(angle2 / snapAngle) * snapAngle;

  if (Math.abs(angle2 - leftAngleLocked) < snapThreshold) {
    angle2 = leftAngleLocked;
    console.log("leftAngleLocked");
  } else if (Math.abs(angle2 - rightAngleLocked) < snapThreshold) {
    angle2 = rightAngleLocked;
    console.log("rightAngleLocked");
  }
  //}

  // normalize angle to positive value
  if (angle2 < 0) {
    angle2 = 360 + angle2;
  }
  angle2 %= 360;

  if (t.angle === angle2) {
    console.log("cusrot has not rotated");
    hasRotated = false;
  } else {
    // rotation only happen here
    //object.set('angle', angle2)
    console.log("cusrot: " + angle2);
    t.angle = angle2;

    // Make sure the constraints apply
    // target.setPositionByOrigin(constraintPosition, t.originX, t.originY)
  }

  return angle2;

  //object.set('angle', angle)
  //console.log(object.originX)
}

function showGuidelines() {}

function toggleDraw() {
  if (canvas.isDrawingMode == 0) {
    canvas.isDrawingMode = 1;
  } else {
    canvas.isDrawingMode = 0;

    this.drawSessionList.forEach(function (object) {
      canvas.remove(object);
    });

    let group = new fabric.Group(this.drawSessionList);

    this.drawSessionList = [];
    canvas.add(group);
  }
}

function update_info() {
  let info_objectAngle = document.getElementById("info_objectAngle");
  //let info_adjustRotation = document.getElementById('info_adjustRotation')
  let info_degree = document.getElementById("info_degree");

  //info_adjustRotation.innerHTML = adjustRotation
}

function createA() {
  canvas.add(this.box1);
  canvas.add(this.box2);
  canvas.add(this.box3);
}
