function getData() {
    var text_field = document.getElementById("text-field").value;
    var select_menu = document.getElementById("dropdown");
    var select = select_menu.options[select_menu.selectedIndex].value;
    var url = "http://localhost:8045/search/" + select + "/" + text_field;
    $.ajax({
        url: url,

        dataType: "json",

        success: function (result) {
            clearDiv("output-container");

            for (var i in result) {
                document.getElementById('output-container').appendChild(getItem(result[i]));
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            document.getElementById("output-container").innerHTML = errorThrown;
        }
    })
}

function startSearch() {
    var text_field = document.getElementById("text-field").value;
    var select_menu = document.getElementById("dropdown");
    var select = select_menu.options[select_menu.selectedIndex].value;

    var search = {
        group: select,
        q: text_field,
    }

    if (text_field !== undefined && text_field !== null && text_field !== "" ) addToModal(search);
    getData();
}

function addToModal(search) {
    var modal = document.getElementById('modal-content');
    var btn = document.createElement('button');
    btn.className = 'searchbtn';
    btn.innerHTML = search.group + ':' + search.q;
    let s = search.q;
    btn.onclick = function () {
        var tf = document.getElementById('text-field');
        tf.value = s;
        getData();
        document.getElementById('myModal').style.display = 'none';
    }
    modal.appendChild(btn);
}

function openHistory() {
    var modal = document.getElementById('myModal');
    modal.style.display = 'block';
}

function getItem(values) {
    var div = document.createElement('DIV');
    var longtext = "";
    for (var i in values) {
        if (typeof values[i] === "string" && values[i].length>24) {
            longtext += i + ' : ' + values[i];
            div.innerHTML += i + " : Long text. Click to expand!<br>";
            div.onclick = function (evt) {
                alert(longtext);
            }
        }
        else {
            console.log(values[i]);
            div.innerHTML += i + ' : ' + values[i] + '<br>';
        }
    }

    div.className = "item-div";
    return div;
}

function clearDiv(div_name) {
    var div = document.getElementById(div_name);
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
}

