/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is MozMill Test code.
 *
 * The Initial Developer of the Original Code is the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Vlad Maniac <vlad.maniac@softvisioninc.eu> (original author)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// Include required modules
var addons = require("../../../../lib/addons");
var {assert} = require("../../../../lib/assertions");
var modalDialog = require("../../../../lib/modal-dialog");
var tabs = require("../../../../lib/tabs");

const ADDON = {
  name: "Echofon",
  page: "https://services.addons.mozilla.org/en-US/firefox/" + 
        "discovery/addon/echofon-for-twitter/?src=discovery-featured"
};

const TIMEOUT_DOWNLOAD = 25000;

function setupModule() {
  controller = mozmill.getBrowserController();
  addonsManager = new addons.AddonsManager(controller);

  tabs.closeAllTabs(controller);
}

function teardownModule() {
  addonsManager.close();
}

/*
 * Tests installation of EULA add-on
 *
 * XXX: Bug 678478
 *      Retrieving the add-on by direct access of its detailed page because 
 *      at the moment we can't predict that any of the sections will provide 
 *      an add-on with EULA
 */
function testInstallAddonWithEULA() {
  // Retrieve add-on via production page
  controller.open(ADDON.page);
  controller.waitForPageLoad();
  
  // XXX: Bug 680045
  //      Add elements to UI map for add-ons with EULA  
  var continueToDownloadLink = new elementslib.Selector(controller.window.document, 
					                 ".install-action");

  // Click on continue to download link
  controller.click(continueToDownloadLink);
  controller.waitForPageLoad();

  var acceptAndInstallButton = new elementslib.Selector(controller.window.document, 
				                         ".install-button");
  var md = new modalDialog.modalDialog(addonsManager.controller.window);
    
  // Install the add-on
  md.start(addons.handleInstallAddonDialog);
  controller.click(acceptAndInstallButton);
  md.waitForDialog(TIMEOUT_DOWNLOAD);

  // Open the Add-ons Manager
  addonsManager.open();
  addonsManager.setCategory({
    category: addonsManager.getCategoryById({id: "extension"})
  });

  // Verify the add-on is installed
  var addon = addonsManager.getAddons({attribute: "name", value: ADDON.name})[0];

  assert.ok(addonsManager.isAddonInstalled({addon: addon}), 
            "The add-on has been correctly installed");
}

// Bug 732353 - Disable all Discovery Pane tests 
//              due to unpredictable web dependencies
setupModule.__force_skip__ = "Bug 732353 - Disable all Discovery Pane tests " + 
                             "due to unpredictable web dependencies";
teardownModule.__force_skip__ = "Bug 732353 - Disable all Discovery Pane tests " + 
                                "due to unpredictable web dependencies";
