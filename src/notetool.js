// import various functions from drive_code
import { performUpload, performGet } from "./drive_code.js"
import { pdfOb } from "./pdf_loader.js"
import {imageOb} from "./img_loader.js"

let output = []
let run = () => {
  Notification.requestPermission()
  // background stuff
  let can = document.querySelector("#canvas")
  can.width = 8000
  can.height = 8000
  let ctx = can.getContext("2d")
  let oldwidth = ctx.lineWidth
  //setInterval(() => {
  //  can = document.querySelector("#canvas")
  //  ctx = can.getContext("2d")
  //  //let existing = ctx.getImageData(0, 0, can.width, can.height)
  //  can.width = window.scrollMaxX + window.innerWidth
  //  can.height = window.scrollMaxY + window.innerHeight
  //  ctx.fillStyle = "#f9d899"
  //  ctx.fillRect(0, 0, window.scrollMaxX + window.innerWidth, window.innerHeight + window.scrollMaxY)
  //  //ctx.putImageData(existing,0,0)

  //}, 3000)
  let expbtn = new ExportBtn()
  let upload = new LoadBtn()
  let spec_load = new loadAllBtn()

  let etoggle = false

  let resize = () => {
    // start with just bottom and sides
    let existing = ctx.getImageData(0, 0, can.width, can.height)
    can.width += 500
    can.height += 500
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, can.width, can.height)
    ctx.putImageData(existing, 0, 0)
  }
  let keys = []
  let oncanvas = false
  // set it to track under tiny interval
  // handle the pressing of shift to move the c
  let mousePos = [0, 0]
  let shiftdown = (e) => {
    let starting = {
      scrollx: window.scrollX,
      scrolly: window.scrollY,
    }
    let canScroll = (e) => {
      // check if starting has an initial or not
      if (starting.initialx == undefined) {
        starting.initialx = e.clientX
        starting.initialy = e.clientY
      }
      window.scrollTo(starting.scrollx + (starting.initialx - e.clientX) * 2.0, starting.scrolly + (starting.initialy - e.clientY) * 4.0)
    }
    if (e.key == "Shift") {
      // add a canvas listener
      can.addEventListener("mousemove", canScroll)
    }
    if (e.key == "p") {
      // try to upload the screenshot that has been saved in the websrc directory
      if (oncanvas) {
        let img = new Image()
        img.onload = () => {
          ctx.drawImage(img, mousePos[0], mousePos[1])
        }
        fetch("./image.png").then(res => res.blob()).then(blb => {
          img.src = URL.createObjectURL(blb)
        })
      }
    }
    if (e.key == "e") {
      // turn on the eraser
      etoggle = !etoggle
      if (oncanvas && etoggle) {
        ctx.lineWidth=20
        ctx.strokeStyle = "white"
      } else {
        ctx.lineWidth = oldwidth
        ctx.strokeStyle = "black"
      }
    }
    if (e.key == "N") {
      // make a textarea box at the point on the screen
      // are these defined?
      if (oncanvas) {
        oncanvas = false
        let tb = new NoteElement(mousePos)
        tb.init()
        e.preventDefault()
      }
    }
    // add a listener to remove all this on shift up
    let shiftup = (e) => {
      if (e.key == "Shift") {
        can.removeEventListener("mousemove", canScroll)
        can.removeEventListener("keyup", shiftup)
        if (window.scrollX + 50 > window.scrollMaxX || window.scrollY + 50 > window.scrollMaxY) {
          resize()
        }
      }
    }

    document.body.addEventListener("keyup", shiftup)
  }
  document.body.addEventListener("keydown", shiftdown)

  let updatePos = (e) => {
    mousePos[0] = e.pageX
    mousePos[1] = e.pageY
  }
  can.addEventListener("mousemove", updatePos)
  //mouse down
  let positions = []
  can.addEventListener("mousedown", (e) => {
    can.removeEventListener("mousemove", updatePos)
    oncanvas = true
    let rect = can.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.topj
    let moving = (e) => {
      let rect = can.getBoundingClientRect()
      let x = e.clientX - rect.left
      let y = e.clientY - rect.top
      positions.push(Math.round(x))
      positions.push(Math.round(y))
      //ctx.lineTo(x, y)
      //ctx.stroke()
      if (x + 50 > can.width || y + 50 > can.height) {
        resize()
      }
    }
    positions.push(Math.round(x))
    positions.push(Math.round(y))
    //ctx.moveTo(x, y)
    //ctx.beginPath()
    // create a moving event
    can.addEventListener("mousemove", moving)
    let up = (e) => {
      // draw the line
      ctx.moveTo(positions[0], positions[1])
      ctx.beginPath()
      for (let i = 2; i < positions.length; i += 2) {
        ctx.lineTo(positions[i], positions[i + 1])
      }
      ctx.stroke()
      output = output.concat(positions)
      output.push(0)
      positions = []
      // remove events
      can.removeEventListener("mousemove", moving)
      can.removeEventListener("mouseup", up)
      can.addEventListener("mousemove", updatePos)
    }
    can.addEventListener("mouseup", up)
  })
  //new ScrollHelper()
  //include the download click
  document.querySelector("#reload").click()
  // make the iframe

}

class NoteElement {
  constructor(pos, value = "") {
    let [x, y] = pos
    this.element = document.createElement("textarea")
    this.element.style.position = "absolute"
    this.element.style.left = x + "px"
    this.element.style.top = y + "px"
    this.element.value = value
    this.element.style.width = "200px"
    this.element.style.height = "200px"
  }
  init() {
    document.body.append(this.element)
    this.element.focus()
    this.element.selectionEnd += 2
    // set the timer
    // adjust content provided on tab
    this.keyactions()
    // setup dragging
  }
  mouseup(e) {
    let func = this.func
    document.body.removeEventListener("mousemove", func)

  }
  mousedown(e) {
    console.log("down ")
    let r = this.element.getBoundingClientRect()
    if (e.pageX - (r.left + window.scrollX) < r.width / 2) {
      this.startx = e.pageX
      this.starty = e.pageY
      console.log("down ", this.startx, this.starty)
      let func = (e) => { this.mousemove(e) }
      document.body.addEventListener("mousemove", func)
      this.func = func


    }
  }
  mousemove(e) {

    let newx = e.pageX
    let newy = e.pageY
    let deltax = newx - this.startx
    let deltay = newy - this.starty
    this.startx = newx
    this.starty = newy
    this.element.style.left = `${parseFloat(this.element.style.left) + deltax}px`
    this.element.style.top = `${parseFloat(this.element.style.top) + deltay}px`
  }
  keyactions() {
    // 
    this.element.addEventListener("mousedown", this.mousedown.bind(this))
    this.element.addEventListener("mouseup", this.mouseup.bind(this))

    //
    this.element.addEventListener("keydown", (e) => {
      if (e.key == "ArrowUp") {
        this.imageob.shiftup()
      }
      if (e.key =="ArrowDown") {
        this.imageob.shiftdown()
      } 
      if (e.key == "ArrowRight") {
        this.pdfob.page+=1
        this.pdfob.loadPage(this.pdfob.page)
      }
      if (e.key =="ArrowLeft") {
        this.pdfob.page-=1
        this.pdfob.loadPage(this.pdfob.page)

      }
      if (e.key == "Enter") {
        let position = this.element.selectionStart
        // get last line
        let lastline = this.element.value.slice(0, position).split("\n").slice(-1)[0]
        // get amount of whitespace there
        let white_count = /^\s*/.exec(lastline)[0]
        this.element.value = this.element.value.slice(0, position) + "\n" + white_count + this.element.value.slice(position)
        this.element.selectionStart = position + 1 + white_count.length
        this.element.selectionEnd = this.element.selectionStart
        e.preventDefault()



      }

      if (e.key == "Control") {
        this.control = true
      }
      if (e.key == "Alt") {
        e.preventDefault()
        this.check()
      }
      if (e.key == "Tab") {
        e.preventDefault()
        let initial = this.element.selectionStart
        this.element.value = this.element.value.slice(0, initial) + "  " + this.element.value.slice(initial)
        this.element.selectionStart = initial + 2
        this.element.selectionEnd = initial + 2

      }
      if (e.key == "Delete") {
        // remove this element
        //this.element.remove()
      }
      // 
      //this.calcHeight()
    })
    this.element.addEventListener("keyup", (e) => {
      if (e.key == "Control") {
        this.control = false
      }
    })
  }
  calcHeight() {
    // width
    let largestline = Math.max(... this.element.value.split("\n").map(e => e.length))
    this.element.style.width = `${largestline * 8 + 30 > 150 ? 150 : largestline * 8 + 30}px`
    this.element.style.height = `${this.element.scrollHeight}px`
  }
  check() {
    console.log("checking")
    if (/-write-/.exec(this.element.value)) {
      // write the file back to the active folder
      // contents gets a line added in front which is the name of the file
      this.element.value = this.element.value.replace(/-write-/, "")
      fetch("http://localhost:8040", {
        method: "POST",
        body: JSON.stringify({
          operation: "-savefile-",
          contents: this.filename + "\n" + this.element.value
        })
      })
    }
    if (/-file-/.exec(this.element.value)) {
      this.element.value = this.element.value.replace(/-file-/, "")
      this.filename = this.element.value
      fetch("http://localhost:8040", {
        method: "POST",
        body: JSON.stringify({
          operation: "-file-",
          contents: this.element.value
        })
      }).then(res => res.text()).then(t => {
        this.element.value = t
      })
    }
    if (/-loadimg .* -/.exec(this.element.value)) {
      let imagename = this.element.value.match(/-loadimg (.*) -/)[1]
      // perform fetch, create image in the #pdfcontainer
      // make arrow keys up and down scroll through the document height wise
      this.imageob = imageOb()
      this.imageob.create(imagename)
      let closure = ()=> {
        let lines = this.element.value.split("\n")
          if (/-top/.exec(lines.slice(-1)[0])) {
            lines.pop()
            this.element.value = lines.join("\n")
          }
          // 
          this.element.value+=`\n-top${this.imageob.topCalc}-`
          let holder = document.querySelector("#pdfcontainer")
          document.querySelector("#pdfcontainer").style.position = "absolute"
          document.querySelector("#pdfcontainer").style.left = `${parseFloat(this.element.style.left) - holder.getBoundingClientRect().width}px`
      }
      this.imageob.ep = closure
    }
    if (/-loadpdf.* -/.exec(this.element.value)) {
      // create a pdf ob attached to this note
      let id = this.element.value.match(/-loadpdf(.*?) -/)[1]
      this.element.value = this.element.value.replace(/-loadpdf.*? -/, id)
      pdfOb().then(pdfob => {
        this.pdfob = pdfob
        this.pdfob.create(id)
        // funcntion to put page count in the bottom of element 
        let closure = ()=> {
          // if the last line was page something then we should replace it
          let lines = this.element.value.split("\n")
          if (/-page/.exec(lines.slice(-1)[0])) {
            lines.pop()
            this.element.value = lines.join("\n")
          }
          // 
          this.element.value+=`\n-page${this.pdfob.page}-`
        }
        this.pdfob.ep =closure 
        // move the canvas to the left of the note element
        let holder = document.querySelector("#pdfcontainer")
        document.querySelector("#pdfcontainer").style.position = "absolute"
        document.querySelector("#pdfcontainer").style.left = `${parseFloat(this.element.style.left) - holder.getBoundingClientRect().width}px`
        document.querySelector("#pdfcontainer").style.top = `${parseFloat(this.element.style.top) - holder.getBoundingClientRect().height}px`
      })
    }
    if (/-page\d+-/.exec(this.element.value.slice(this.element.startSelection,this.element.endSelection))) {
      // get the page 
      let num = this.element.value.slice(this.element.startSelection,this.element.endSelection).match(/-page(\d+)-/)[1]
      this.pdfob.loadPage(num)
        let holder = document.querySelector("#pdfcontainer")
        document.querySelector("#pdfcontainer").style.position = "absolute"
        document.querySelector("#pdfcontainer").style.left = `${parseFloat(this.element.style.left) - holder.getBoundingClientRect().width}px`
    }
    if (/-start-/.exec(this.element.value)) {
      this.element.value = this.element.value.replace(/-start-/, "-running-")
      this.begin = new Date()
      this.timeout = setTimeout(() => {
        let notify = new Notification("20 mins passed")
      }, 20 * 60 * 1000)

    }
    if (/-stop-/.exec(this.element.value)) {
      this.end = new Date()
      this.element.value = this.element.value.replace(/-stop-/, "")
      let datestring = `${new Date().toUTCString()}: ${((this.end.getTime() - this.begin.getTime()) / (1000 * 60)).toFixed(3)}`
      this.element.value = this.element.value.replace(/-running-/, datestring)
      let position = this.element.selectionStart
      clearTimeout(this.timeout)
    }

    if (/-tex-/.exec(this.element.value)) {
      let ta = this.element
      fetch("http://localhost:8040/", {
        method: "POST",
        body: JSON.stringify(
          {
            operation: '-latex-',
            contents: this.element.value.replace(/-tex-/, "")
          }
        )
      }).then(res => {
        // perform the image fetch
        let img = new Image()
        img.onload = () => {
          let rect = ta.getBoundingClientRect()
          let can = document.querySelector("canvas")
          let ctx = can.getContext("2d")
          ctx.drawImage(img, rect.x + rect.width, rect.y + rect.height)
        }
        fetch("./image.png").then(res => res.blob()).then(blb => {
          img.src = URL.createObjectURL(blb)
        })

      })
    }
    if (/-date-/.exec(this.element.value)) {
      // remove the command string
      this.element.value = this.element.value.replace(/-date-/, "")
      fetch("http://localhost:8040", {
        method: "POST",
        body: JSON.stringify(
          {
            operation: "-date-",
            contents: this.element.value
          }
        )
      }).then(res => res.text()).then(t => {
        this.element.value = t
      })
    }
  }
  timer() {
    this.timer = setInterval(() => { this.check() }, 10000)
  }
}

class JSONReader {
  constructor() {
    // look for the active file
    performGet().then(res => res.json()).then(rawText => {
      let jsonArray = JSON.parse(rawText)
      jsonArray.map(j => {
        let noteele = new NoteElement([Math.abs(j.x), Math.abs(j.y)], j.value)
        noteele.init()
      })
    })
  }
}

class CanvasLoader {
  constructor() {
    // look for active canvas file
    let can = document.querySelector("#canvas")
    let img = new Image()
    img.onload = () => {
      let ctx = can.getContext("2d")
      can.width = img.width
      can.height = img.height
      ctx.drawImage(img, 0, 0)
    }
    performGet().then(res=> res.json()).then(j => {
      img.src = JSON.parse(j).canvas_data
    })
  }
}

class ScrollHelper {
  constructor() {
    this.last = { x: window.scrollX, y: window.scrollY }
    window.onscroll = this.extra.bind(this)
  }
  extra() {
    console.log("scrolliing")
    if (window.scrollX != this.last.x) {
      // scrollby extra
      window.scrollBy(30, 0)
      this.last.x = window.scrollX
    }
    if (window.scrollY != this.last.y) {
      window.scrollBy(0, 30)
      this.last.y = window.scrollY
    }
  }
}

class loadAllBtn {
  constructor() {
    this.btn = document.createElement("button")
    this.btn.innerHTML = "load all"
    this.btn.addEventListener("click", () => {
      this.load()
    })
  }
  load() {
    //setInterval(()=>{let dwnload = document.querySelector("#download")
    //  dwnload.click()
    //  console.log("downloading")
    //}, 60 * 1000)
    fetch("/all").then(res => res.json()).then(j => {
      // create a selector element and append it to the top 
      this.select = document.createElement("select")
      for (let e of j) {
        // make an option
        let opt = document.createElement("option")
        opt.value = `${e.id}`
        opt.innerHTML = `${e.size},${e.ctime}`
        this.select.append(opt)
      }
      document.body.prepend(this.select)
      this.select.onchange = () => {
        // send a specific load request for the id given add notes for that file
        let id = this.select.value
        fetch("/idfetch", {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
            "Content-Length": this.select.value.length,
          },
          body: this.select.value
        }).then(res => res.json()).then(jsonArray => {
          // make notes from all of it
          jsonArray.map(j => {
            let noteele = new NoteElement([Math.abs(j.x), Math.abs(j.y)], j.value)
            noteele.init()
          })
        })


      }
    })
  }
}

class LoadBtn {
  constructor() {
    this.btn = document.createElement("button")
    document.body.prepend(this.btn)
    this.btn.addEventListener("click", () => {
      this.load()
    })
    this.btn.id = "reload"
    this.btn.innerHTML = "Load prev data"
  }
  load() {
    // call the json loader and the canvasloader
    let cl = new CanvasLoader()
    //let jl = new JSONReader()
    //setInterval(() => {
    //  let dwnload = document.querySelector("#download")
    //  dwnload.click()
    //  console.log("downloading")
    //}, 60 * 1000)
  }
}

class ExportBtn {
  constructor() {
    this.btn = document.createElement("button")
    this.btn.innerHTML = "Download"
    this.btn.id = "download"
    this.btn.addEventListener("click", () => {
      let info = this.retrieveInfo()
      // create a, and use for download
      // use performUpload
      // also canvas download
      let canvas = document.querySelector("#canvas").toDataURL()
      performUpload(JSON.stringify({canvas_data:canvas}))
      //fetch("/background", { method: "POST", body: canvas })
    })
    document.body.prepend(this.btn)
    // get a list of the textareas on the screen
  }
  retrieveInfo() {
    let texts = Array(...document.querySelectorAll("textarea"))
    // for each, get the x,y and value
    let info = texts.map(ta => {
      let rect = ta.getBoundingClientRect()
      return { x: rect.x + window.scrollX, y: rect.y + window.scrollY, value: ta.value }
    })
    return info
  }
}

export { run }
//
