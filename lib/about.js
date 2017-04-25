define(function () {
  'use strict';

  return function () {
    this.render = function render(d) {
      d.innerHTML = _.t('sidebar.aboutInfo') +

        '<h3>AGPL 3</h3>' +

        '<p>Copyright (C) Milan Pässler</p>' +
        '<p>Copyright (C) Nils Schneider</p>' +

        '<p>This program is free software: you can redistribute it and/or ' +
        'modify it under the terms of the GNU Affero General Public ' +
        'License as published by the Free Software Foundation, either ' +
        'version 3 of the License, or (at your option) any later version.</p>' +

        '<p>This program is distributed in the hope that it will be useful, ' +
        'but WITHOUT ANY WARRANTY; without even the implied warranty of ' +
        'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the ' +
        'GNU Affero General Public License for more details.</p>' +

        '<p>You should have received a copy of the GNU Affero General ' +
        'Public License along with this program. If not, see ' +
        '<a href="https://www.gnu.org/licenses/">' +
        'https://www.gnu.org/licenses/</a>.</p>' +

        '<p>The source code is available at ' +
        '<a href="https://github.com/ffrgb/meshviewer">' +
        'https://github.com/ffrgb/meshviewer</a>.</p>';
    };
  };
});
