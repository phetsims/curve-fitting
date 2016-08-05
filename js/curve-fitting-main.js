// Copyright 2015-2016, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var CurveFittingScreen = require( 'CURVE_FITTING/curve-fitting/CurveFittingScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var curveFittingTitleString = require( 'string!CURVE_FITTING/curve-fitting.title' );

  var simOptions = {
    credits: {
      leadDesign: 'Michael Dubson, Amanda McGarry',
      softwareDevelopment: 'Mike Dubson, Chris Malley, Jonathan Olson, Martin Veillette',
      team: 'Trish Loeblein, Ariel Paul, Kathy Perkins',
      qualityAssurance: '', //TODO see #34
      graphicArts: '', //TODO see #34
      thanks: 'Thanks to Mobile Learner Labs for working with the PhET development team to convert this simulation to HTML5.'
    }
  };

  SimLauncher.launch( function() {
    var sim = new Sim( curveFittingTitleString, [ new CurveFittingScreen() ], simOptions );
    sim.start();
  } );
} );