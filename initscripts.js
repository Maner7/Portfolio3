var modal = document.getElementById('myModal');
var span = document.getElementsByClassName("close")[0];
var text_field = document.getElementById('text-field');

span.onclick = function () {
    modal.style.display = "none";
}
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
text_field.onkeydown = function (event) {
    if (event.keyCode == 13)
        startSearch();
}
window.onmousedown = function (event) {
    console.log(event);
}