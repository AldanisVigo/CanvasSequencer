class Dialog{
    constructor(title,msg,icon,visible,elem){
        this.title = title || ''
        this.msg = msg || ''

        let icons = {
            warning : 'images/warning.svg',
            error : 'images/error.svg',
            success : 'images/success.svg',
            info : 'images/info.svg'
        }

        this.icon = icon || icons.info
        this.visible = visible
        this.dialog = this.generateDialog()
        if(elem){
            this.elem
            this.elem = elem 
        }else{
            let globalScreen = document.createElement('div')
            globalScreen.style.position = 'absolute'
            globalScreen.style.width = '100vw'
            globalScreen.style.height = '100vw'
            globalScreen.style.visibility = visible
            globalScreen.style.zIndex = visible ? 1 : -1
            globalScreen.style.background = visible ? 'rgba(0,0,0,0.5)' : 'transparent'
            globalScreen.style.display = 'flex'
            globalScreen.style.alignContent = 'center'
            globalScreen.style.alignItems = 'center'
            globalScreen.appendChild(this.generateDialog())
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

        //Create the close button
        let dialogCloseBtn = document.createElement('div')
        dialogCloseBtn.innerText = 'X'
        dialogCloseBtn.classList.add('dialog_close_btn')

        //Create the dialog content container
        let dialogContent = document.createElement('div')
        dialogContent.classList.add('dialog_content')

        //Create the dialog icon element
        let dialogIcon = document.createElement('img')
        dialogIcon.classList.add('dialog_icon')
        dialogIcon.width = 40
        dialogIcon.height = 40
        dialogIcon.src = this.icon

        //Create the dialog text element
        let dialogText = document.createElement('div')
        dialogText.classList.add('dialog_text')
        dialogText.innerText = this.msg

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

        //Add the dialogIcon to the dialogContent
        dialogContent.appendChild(dialogIcon)

        //Add the dialog text to the dialogContent
        dialogContent.appendChild(dialogText)

        return dialog
    }

    close(){
        this.visible = false
        this.dialog.style.visibility = 'hidden'
    }

    open(){
        this.visible = true
        this.dialog.style.visibility = 'visible'
    }

    toggle(){
        this.visible = !this.visible
        this.dialog.style.visibility = this.visible ? 'visible' : 'hidden'
    }
}

