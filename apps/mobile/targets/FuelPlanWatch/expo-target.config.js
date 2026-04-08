/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'watch',
  name: 'FuelPlanWatch',
  displayName: 'Fuel Plan',
  bundleIdentifier: '.watchkitapp',
  deploymentTarget: '10.0',
  icon: '../../assets/icon.png',
  frameworks: ['WatchConnectivity', 'AVFoundation', 'WatchKit'],
};
