img_background = document.getElementById("img")
let socket = io()
console.log("here")
socket.on('connection', () => {
    console.log("connected!")
})
socket.on('img', data => {
    let [img_bytes, label, price, risk, premium] = data
    let img = new Image()
    img.src = img_bytes
    //console.log(`url('data:image/jpg;base64,${img_bytes})`)
    console.log("heeere")
    console.log($("#img"))
    $("#image").remove()
    $("body").append(`<img id="image" src="${img.src}?${new Date().getTime()}"></img>`)
    $("#type").html(label)
    $("#value").html(price)
    $("#risk").html(risk)
    $("#premium").html(premium)
})