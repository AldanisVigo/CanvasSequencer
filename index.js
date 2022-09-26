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
    if(stepDialogVisible){
        // // paused = true
        // drawStepDialog()
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
    }else{
        handleStepDialogDrag()
    }
}