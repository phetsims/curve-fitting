// Copyright 2015-2017, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( require => {
  'use strict';

  // modules
  const CurveFittingScreen = require( 'CURVE_FITTING/curve-fitting/CurveFittingScreen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  const curveFittingTitleString = require( 'string!CURVE_FITTING/curve-fitting.title' );

  //TODO finalize credits with team leader, see https://github.com/phetsims/curve-fitting/issues/34
  const simOptions = {
    credits: {
      leadDesign: 'Michael Dubson, Amanda McGarry',
      softwareDevelopment: 'Michael Dubson, Chris Malley, Jonathan Olson, Martin Veillette',
      team: 'Trish Loeblein, Ariel Paul, Kathy Perkins',
      qualityAssurance: '',
      graphicArts: '',
      thanks: 'Thanks to Mobile Learner Labs for working with the PhET development team to convert this simulation to HTML5.'
    }
  };

  SimLauncher.launch( () => {
    const sim = new Sim( curveFittingTitleString, [ new CurveFittingScreen() ], simOptions );
    sim.start();
  } );
} );