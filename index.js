let playhead_position = 0
let channels = 4
let steps_per_channel = 4
let bars = 16
let barCountInput = document.getElementById('bar_count')
barCountInput.value = bars
let barCountLabel = document.getElementById('bar_count_label')
let trackCountInput = document.getElementById('track_count')
trackCountInput.value = channels
const initializeSequencerStepsState = () => {
    let chans = []
    for(let i = 0; i < channels;i++){
        let steps = Array(steps_per_channel).fill(false)
        chans.push(steps)
    }
    return chans
}

let sequencerStepsState = initializeSequencerStepsState()
let sequencer_canvas = document.getElementById('sequencer_canvas')
let sequencer_canvas_ctx = sequencer_canvas.getContext('2d')
let stepTemplate = {
    width: 13,
    height: 25,
    states : {
        playhead_on : {
            step_on : {
                stroke : '#000',
                fill : '#A020F0'
            },
            step_off : {
                stroke : '#FFA500',
                fill : 'none'
            }
        },
        playhead_off : {
            step_on : {
                stroke : '#000',
                fill : 'red'
            },
            step_off : {
                stroke : '#000',
                fill : 'none'
            }
        }
    }
}
steps_per_channel = bars * 4
sequencer_canvas.width = steps_per_channel * stepTemplate.width
barCountInput.oninput = e => {
    steps_per_channel = Number(e.target.value) * 4
    sequencer_canvas.width = steps_per_channel * stepTemplate.width
}
let sequencer_channels_canvas = document.getElementById('channels_canvas')
sequencer_channels_canvas.height = (channels * stepTemplate.height / 2)
trackCountInput.oninput = e => {
    channels = Number(e.target.value)
    sequencerStepsState.push(Array(steps_per_channel).fill(false))
    sequencer_canvas.height = channels * stepTemplate.height
    sequencer_channels_canvas.height = (channels * stepTemplate.height / 2)
    sequencer_channels_canvas.style.background = 'white'
    drawSequencerSteps()
    drawChannelButtons()
}
const drawChannelButtons = () => {
    let ctx = sequencer_channels_canvas.getContext('2d')
    //Clear the canvas
    ctx.fillStyle = 'whitesmoke'
    ctx.fillRect(0,0,sequencer_channels_canvas.width,sequencer_channels_canvas.height)
    //Draw the buttons again
    for(let i = 0; i < channels; i++){
        ctx.beginPath()
        ctx.moveTo(0, i * stepTemplate.height)
        ctx.fillStyle = 'red'
        ctx.strokeStyle = selectedChannel == i ? 'red' : 'black'
        ctx.fillRect(0, (i * stepTemplate.height) / 2,80,stepTemplate.height)
        ctx.strokeRect(0,(i * stepTemplate.height) / 2,80,stepTemplate.height)
        // ctx.moveTo(0, (i * stepTemplate.height) / 2)
        ctx.font = stepTemplate.height / 3 + "px Arial"
        ctx.fillStyle = 'white'
        ctx.fillText('' + Number(i + 1), 11, (i * stepTemplate.height) / 2 + (stepTemplate.height / 2) - 3)
        ctx.fillStyle = 'transparent'
        ctx.strokeStyle = 'transparent'
    }
}

// const drawStepDialog = () => {
//     let ctx = sequencer_canvas.getContext('2d')
//     ctx.beginPath()
//     ctx.fillStyle = 'white'
//     ctx.fillRect((sequencer_canvas.width / 2) - 100, (sequencer_canvas.height / 2) - 50,200,100)
//     ctx.fillStyle = 'transparent'
// }

let stepDialogVisible = false
let selectedChannel
sequencer_channels_canvas.onclick = e => {
    let rect = sequencer_channels_canvas.getBoundingClientRect();
    // let nx = e.clientX - rect.left;
    let ny = e.clientY - rect.top;
    // let step = Number(Math.floor(nx / stepTemplate.width)) 
    let chan = Number(Math.floor(ny / stepTemplate.height))
    console.log(`You clicked channel ${chan}`)
    selectedChannel = chan

    let exampleButton = document.createElement('button')
    exampleButton.innerText = 'Example Button'
    exampleButton.onclick = e => {
        alert("You clicked on channel " + Number(chan+1))
    }

    let dialog = new Dialog(`Channel ${chan + 1} Chain`,null,exampleButton,null,true,null)
    dialog.open()
    // stepDialogVisible = true
}


drawChannelButtons()
let paused = false
const drawSequencerSteps = () => {
    sequencer_canvas_ctx.fillStyle = document.body.style.background
    sequencer_canvas_ctx.fillRect(0,0,sequencer_canvas.width, sequencer_canvas.height)
    if(!paused){
        for(let chan = 0; chan < channels; ++chan){
            for(let step_pos = 0; step_pos < steps_per_channel; ++step_pos){            
                //get x position of current step
                let step_x = step_pos * stepTemplate.width
                //get y position of current step
                let step_y = chan * stepTemplate.height
                //draw current step
                sequencer_canvas_ctx.beginPath()
                sequencer_canvas_ctx.moveTo(step_x,step_y)
                //get the context into a shorter variable name
                let ctx = sequencer_canvas_ctx
                if(sequencerStepsState[chan]){
                    //Set the canvas stoke and fill style depending on the state of the step and the playhead position
                    if(sequencerStepsState[chan][step_pos] && playhead_position == step_pos ){
                        ctx.strokeStyle = 'orange'
                        ctx.fillStyle = 'purple'
                    }else if(sequencerStepsState[chan][step_pos] && playhead_position != step_pos){
                        ctx.strokeStyle = 'black'
                        ctx.fillStyle = 'red'
                    }else if(!sequencerStepsState[chan][step_pos] && playhead_position == step_pos){
                        ctx.strokeStyle = 'orange'
                        ctx.fillStyle = 'blue'
                    }else if(!sequencerStepsState[chan][step_pos] && playhead_position != step_pos){
                        ctx.strokeStyle = 'black'
                        ctx.fillStyle = 'blue'
                    }
                    //Draw the step on the sequencer canvas
                    ctx.fillRect(step_x,step_y,stepTemplate.width,stepTemplate.height)
                    ctx.lineWidth = 1;
                    ctx.strokeRect(step_x,step_y,stepTemplate.width,stepTemplate.height)
                    ctx.fillStyle = 'blue';
                    ctx.stokeStyle = 'blue';
                }
            }
        }
    }
}

let bpmControl = document.getElementById('bpm_control')
let bpm = bpmControl.value * steps_per_channel, bpmInterval, startTime, now, then, elapsed
then = performance.now()
startTime = then
bpmInterval = 1000 * 60 / bpm
bpmControl.oninput = e => {
    bpm = e.target.value
    bpmInterval = 1000 * 60 / (bpm * steps_per_channel)
    document.getElementById('bpm_label').innerText = 'bpm: ' + bpm
}
const animatePlayhead = () => {
    //request another frame
    requestAnimationFrame(animatePlayhead)
    now = performance.now()
    elapsed = now - then
    // if enough time has elapsed, draw the next frame
    if (elapsed > bpmInterval) {
        then = now - (elapsed % bpmInterval)
        //step forward
        if(playhead_position < steps_per_channel - 1){
            playhead_position++
        }else{
            playhead_position = 0
        }
        drawSequencerSteps()
    }
}
animatePlayhead()
drawSequencerSteps()
const toggleStep = (chan,step) => {
    sequencerStepsState[chan][step] = !sequencerStepsState[chan][step]
    drawSequencerSteps()
}



sequencer_canvas.onclick = (e) => {
    let rect = sequencer_canvas.getBoundingClientRect();
    let nx = e.clientX - rect.left;
    let ny = e.clientY - rect.top;
    let step = Number(Math.floor(nx / stepTemplate.width)) 
    let chan = Number(Math.floor(ny / stepTemplate.height))
    if(!stepDialogVisible){
        toggleStep(chan,step)
    }
}

class Dialog{
    constructor(title,msg,content,icon,visible,elem){
        this.title = title || ''
        this.msg = msg || ''
        this.content = content
        this.icons = {
            warning : 'images/warning.svg',
            error : 'images/error.svg',
            success : 'images/success.svg',
            info : 'images/info.svg'
        }

        this.icon = icon || this.icons.info
        this.visible = visible
        this.dialog = this.generateDialog()
        if(elem){
            this.elem
            this.elem = elem 
        }else{
            let globalScreen = document.createElement('div')
            globalScreen.classList.add('global_dialog_screen')
            this.elem = globalScreen
            globalScreen.style.position = 'absolute'
            globalScreen.style.width = '100vw'
            globalScreen.style.height = '100vw'
            globalScreen.style.visibility = visible
            globalScreen.style.zIndex = visible ? 1 : -1
            globalScreen.style.background = visible ? 'rgba(0,0,0,0.5)' : 'transparent'
            globalScreen.style.display = 'flex'
            globalScreen.style.alignContent = 'center'
            globalScreen.style.alignItems = 'center'
            globalScreen.appendChild(this.dialog)
            document.body.appendChild(globalScreen)
        }
    }

    generateDialog(){
        let dialog = document.createElement('div')
        dialog.classList.add('dialog')

        //Create the header bar
        let dialogHeader = document.createElement('div')
        dialogHeader.classList.add('dialog_header')

        //Create dialog title element
        let dialogTitle = document.createElement('div')
        
        //Add the title to the dialogTitle's inner text
        dialogTitle.innerText = this.title

        //Add some margin right to the title element so it
        //does not clash with the close button next to it
        dialogTitle.style.marginRight = '10px'

        //Create the close button
        let dialogCloseBtn = document.createElement('div')
        dialogCloseBtn.innerText = 'X'
        dialogCloseBtn.classList.add('dialog_close_btn')

        //Create the dialog content container
        let dialogContent = document.createElement('div')
        dialogContent.classList.add('dialog_content')

        //Add the dialogHeader to the dialog
        dialog.appendChild(dialogHeader)

        //Add the dialogContent to the dialog
        dialog.appendChild(dialogContent)
        
        //Add the dialog title to the dialog header
        dialogHeader.appendChild(dialogTitle)

        //Add the dialogCloseBtn to the dialogHeader
        dialogHeader.appendChild(dialogCloseBtn)
        
        //Listen for click events on the dialogCloseBtn
        dialogCloseBtn.onclick = () => this.close()


        if(this.icon && this.msg){ //If there's a message

            //Create the dialog icon element
            let dialogIcon = document.createElement('img')
            dialogIcon.classList.add('dialog_icon')
            dialogIcon.width = 40
            dialogIcon.height = 40
            dialogIcon.src = this.icons[this.icon]

            //Create the dialog text element
            let dialogText = document.createElement('div')
            dialogText.classList.add('dialog_text')
            dialogText.innerText = this.msg

            //Add the dialogIcon to the dialogContent
            dialogContent.appendChild(dialogIcon)

            //Add the dialog text to the dialogContent
            dialogContent.appendChild(dialogText)

        } //Otherwise there's content instead
        else {
            //Add the content to the dialog content
            dialogContent.appendChild(this.content)
        }

        return dialog
    }

    close(){
        console.log("Closing dialog")
        this.visible = false
        this.dialog.style.visibility = 'hidden'
        this.elem.style.display = 'none'
    }

    open(){
        this.visible = true
        this.dialog.style.visibility = 'visible'
        this.elem.style.display = 'block'
    }

    toggle(){
        this.visible = !this.visible
        this.dialog.style.visibility = this.visible ? 'visible' : 'hidden'
        this.elem.style.display = this.visible ? 'block' : 'none'
    }
}