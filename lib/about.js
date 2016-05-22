define(function () {
  return function () {
    this.render = function (d) {
      var el = document.createElement("div");
      d.appendChild(el);
      var s = "<h2>Über HopGlass</h2>";

      s += "<p>Mit Doppelklick und Shift+Doppelklick kann man in der Karte ";
      s += "auch zoomen.</p>";

      s += "<h3>AGPL 3</h3>";

      s += "<p>Copyright (C) Milan Pässler</p>";
      s += "<p>Copyright (C) Nils Schneider</p>";

      s += "<p>This program is free software: you can redistribute it and/or ";
      s += "modify it under the terms of the GNU Affero General Public ";
      s += "License as published by the Free Software Foundation, either ";
      s += "version 3 of the License, or (at your option) any later version.</p>";

      s += "<p>This program is distributed in the hope that it will be useful, ";
      s += "but WITHOUT ANY WARRANTY; without even the implied warranty of ";
      s += "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the ";
      s += "GNU Affero General Public License for more details.</p>";

      s += "<p>You should have received a copy of the GNU Affero General ";
      s += "Public License along with this program. If not, see ";
      s += "<a href=\"https://www.gnu.org/licenses/\">";
      s += "https://www.gnu.org/licenses/</a>.</p>";

      s += "<p>The source code is available at ";
      s += "<a href=\"https://github.com/plumpudding/hopglass\">";
      s += "https://github.com/plumpudding/hopglass</a>.";

      el.innerHTML = s;
    };
  };
});
