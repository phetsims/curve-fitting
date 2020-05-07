// Copyright 2015-2020, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import curveFittingStrings from './curveFittingStrings.js';
import CurveFittingScreen from './curve-fitting/CurveFittingScreen.js';

const curveFittingTitleString = curveFittingStrings[ 'curve-fitting' ].title;

const simOptions = {
  credits: {
    leadDesign: 'Michael Dubson, Amanda McGarry',
    softwareDevelopment: 'Michael Dubson, Chris Malley, Jonathan Olson, Saurabh Totey, Martin Veillette',
    team: 'Trish Loeblein, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Jaspe Arias, Logan Bray, Megan Lai, Liam Mulhall, Kathryn Woessner',
    graphicArts: '',
    thanks: 'Thanks to Mobile Learner Labs for working with the PhET development team to convert this simulation to HTML5.'
  }
};

simLauncher.launch( () => {
  const sim = new Sim( curveFittingTitleString, [ new CurveFittingScreen() ], simOptions );
  sim.start();
} );