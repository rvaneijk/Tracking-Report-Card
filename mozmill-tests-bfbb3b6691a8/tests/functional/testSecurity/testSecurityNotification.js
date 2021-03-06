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
 * The Original Code is Mozmill Test Code.
 *
 * The Initial Developer of the Original Code is Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Aakash Desai <adesai@mozilla.com>
 *   Anthony Hughes <ashughes@mozilla.com>
 *   Henrik Skupin <hskupin@mozilla.com>
 *   Aaron Train <atrain@mozilla.com>
 *   Remus Pop <remus.pop@softvision.ro>
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

const gDelay = 0;
const gTimeout = 5000;

var setupModule = function(module) {
  module.controller = mozmill.getBrowserController();
}

/**
 * Test the identity button and Bad Cert error page
 */
var testSecNotification = function() {
  // Go to a secure HTTPS site
  controller.open("https://addons.mozilla.org/licenses/5.txt");
  controller.waitForPageLoad();

  // Identity box should have a green background
  var identityBox = new elementslib.ID(controller.window.document, "identity-box");
  controller.assertJSProperty(identityBox, "className", "verifiedIdentity");

  // Go to an unsecure (HTTP) site
  controller.open("http://www.mozilla.org/");
  controller.waitForPageLoad();

  // Identity box should have a gray background
  controller.assertJSProperty(identityBox, "className", "unknownIdentity");

  // Go to a website which does not have a valid cert
  controller.open("https://mozilla.org/");
  controller.waitForPageLoad();

  // Verify the link in Technical Details is correct
  var link = new elementslib.ID(controller.tabs.activeTab, "cert_domain_link");
  controller.waitForElement(link, gTimeout);
  controller.assertJSProperty(link, "textContent", "*.mozilla.org");

  // Verify "Get Me Out Of Here!" button appears
  controller.assertNode(new elementslib.ID(controller.tabs.activeTab, "getMeOutOfHereButton"));

  // Verify "Add Exception" button appears
  controller.assertNode(new elementslib.ID(controller.tabs.activeTab, "exceptionDialogButton"));

  // Verify the error code is correct
  var text = new elementslib.ID(controller.tabs.activeTab, "technicalContentText");
  controller.waitForElement(text, gTimeout);
  controller.assertJS("subject.textContent.indexOf('ssl_error_bad_cert_domain') != -1", text.getNode());
}

// XXX: Bug 708491 - testSecurityNotification.js fails due to timeout
//      on cert_domain_link
setupModule.__force_skip__ = "Bug 708491 - testSecurityNotification.js fails"+
                             "due to timeout on cert_domain_link";
