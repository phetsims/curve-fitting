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
      //TODO fill in proper credits, all of these fields are optional, see joist.AboutDialog
      leadDesign: '',
      softwareDevelopment: '',
      team: '',
      qualityAssurance: '',
      graphicArts: '',
      thanks: ''
    }
  };

  SimLauncher.launch( function() {
    var sim = new Sim( curveFittingTitleString, [ new CurveFittingScreen() ], simOptions );
    sim.start();
  } );
} );