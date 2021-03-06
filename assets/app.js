"use strict";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then(function () {
        return console.log("service worker registered");
      })
      .catch(function (err) {
        return console.log("service worker not registered", err);
      });
  });
}

(function () {
  var lang = localStorage.getItem("lang") || "np";
  var currentTheme = localStorage.getItem("theme") || "dark";
  var themeSwitch = document.querySelector('.theme input[type="checkbox"]');
  var langSwitch = document.querySelector('.lang input[type="checkbox"]');
  var sortNameEl = document.querySelector(".sort-name");
  var sortPriceEl = document.querySelector(".sort-price");
  var rootEl = document.querySelector("#root");

  var name = { en: "Commodity Name", np: "कृषि उपज" };
  var price = { en: "Price", np: "मूल्य" };
  var min = { en: "Min", np: "न्यूनतम" };
  var max = { en: "Max", np: "अधिकतम" };
  var avg = { en: "Average", np: "‌‌औसत" };

  document.documentElement.setAttribute("data-theme", currentTheme);
  fetchData();

  themeSwitch.checked = currentTheme === "dark";
  langSwitch.checked = lang === "np";

  document
    .querySelector(".dropbtn")
    .addEventListener("click", function myFunction() {
      document.getElementById("myDropdown").classList.toggle("show");
    });

  // Close the dropdown if the user clicks outside of it
  window.onclick = function (event) {
    if (!event.target.matches(".dropbtn")) {
      var dropdownEls = document.getElementsByClassName("dropdown-content");

      for (var i = 0; i < dropdownEls.length; i++) {
        var openDropdown = dropdownEls[i];
        if (openDropdown.classList.contains("show")) {
          openDropdown.classList.remove("show");
        }
      }
    }
  };

  themeSwitch.addEventListener("change", function (e) {
    if (e.target.checked) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  });

  langSwitch.addEventListener("change", function (e) {
    lang = e.target.checked ? "np" : "en";
    localStorage.setItem("lang", lang);
    fetchData();
  });

  sortNameEl.addEventListener("click", sortBy(".name"));
  sortPriceEl.addEventListener("click", sortBy(".price"));

  function fetchData() {
    fetch("/" + lang + ".html")
      .then(function (res) {
        return res.text();
      })
      .then(function (html) {
        var tempDom = Object.assign(document.createElement("div"), {
          innerHTML: html,
        });
        var headerData = tempDom.querySelectorAll('td[colspan="5"]');
        setTitles(
          headerData[0].textContent.trim(),
          headerData[1].textContent.trim()
        );
        rootEl.innerHTML = "";
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (
            var _iterator = tempDom
                .querySelectorAll('[class*="row"]')
                [Symbol.iterator](),
              _step;
            !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
            _iteratorNormalCompletion = true
          ) {
            var row = _step.value;

            var data = {
              name: row.children[0].textContent.trim(),
              unit: row.children[1].textContent.trim(),
              min: row.children[2].textContent.trim(),
              max: row.children[3].textContent.trim(),
              avg: row.children[4].textContent.trim(),
            };
            rootEl.innerHTML +=
              '<div class="card"><h3 class="name">' +
              data.name +
              '</h3><div><div><span class="price" title="' +
              avg[lang] +
              '">' +
              data.avg +
              '</span><small class="unit">/' +
              data.unit +
              '</small></div><div class="min-max"><span title="' +
              min[lang] +
              '" class="min">' +
              data.min +
              '</span><span title="' +
              max[lang] +
              '" class="max">' +
              data.max +
              "</span></div></div></div>";
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      });
  }

  function setTitles(subtitle, date) {
    var isNp = lang === "np";
    var title = isNp ? "तरकारी" : "Tarkari";
    date = date.replace("-", ", ");
    document.title = title + " - " + subtitle + " (" + date + ")";
    document.querySelector(".title").innerHTML = title;
    document.querySelector(".subtitle").innerHTML =
      subtitle + ' <span class="date">(' + date + ")</span>";
    document.body.classList.add(lang);
    document.body.classList.remove(isNp ? "en" : "np");
    sortNameEl.innerHTML = name[lang];
    sortPriceEl.innerHTML = price[lang];
  }

  function sortBy(selector) {
    var ascSortedAttribute = "data-asc";
    return function () {
      var isPrice = selector === ".price";
      var isAsc = rootEl.hasAttribute(ascSortedAttribute);
      var sortA = isAsc ? -1 : 1;
      var sortB = isAsc ? 1 : -1;

      sortNameEl.classList = "sort-name";
      sortPriceEl.classList = "sort-price";

      if (isPrice) {
        sortPriceEl.classList.add(isAsc ? "desc" : "asc");
      } else {
        sortNameEl.classList.add(isAsc ? "desc" : "asc");
      }

      Array.from(rootEl.children)
        .sort(function (a, b) {
          var aText = a.querySelector(selector).innerText;
          var bText = b.querySelector(selector).innerText;
          if (isPrice) {
            var aNumber = langSwitch.checked ? npToEnNumber(aText) : +aText;
            var bNumber = langSwitch.checked ? npToEnNumber(bText) : +bText;
            console.log({ aText, bText });
            return isAsc ? aNumber - bNumber : bNumber - aNumber;
          } else {
            return aText > bText ? sortA : sortB;
          }
        })
        .forEach(function (node) {
          rootEl.appendChild(node);
        });

      rootEl.toggleAttribute(ascSortedAttribute);
    };
  }

  function npToEnNumber(npNumbers) {
    var numberMap = {
      "०": 0,
      "१": 1,
      "२": 2,
      "३": 3,
      "४": 4,
      "५": 5,
      "६": 6,
      "७": 7,
      "८": 8,
      "९": 9,
    };
    return parseInt(
      npNumbers.split("").reduce(function (acc, n) {
        return acc + numberMap[n] || 0;
      }, "")
    );
  }
})();
