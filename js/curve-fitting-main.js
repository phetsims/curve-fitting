//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var Sim = require( 'JOIST/Sim' );
  var CurveFittingModel = require( 'CURVE_FITTING/curve-fitting/model/CurveFittingModel' );
  var CurveFittingView = require( 'CURVE_FITTING/curve-fitting/view/CurveFittingView' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var simTitle = require( 'string!CURVE_FITTING/curve-fitting.name' );

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

  // Appending '?dev' to the URL will enable developer-only features.
  if ( window.phetcommon.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  SimLauncher.launch( function() {
    var sim = new Sim( simTitle, [
      new Screen( simTitle, null,
        function() {return new CurveFittingModel();},
        function( model ) {return new CurveFittingView( model );},
        { backgroundColor: 'rgb( 187, 230, 246 )' }
      )
    ], simOptions );
    sim.start();
  } );
} );