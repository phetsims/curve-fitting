//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 * @author John Blanco (PhET)
 */
define( function( require ) {
  'use strict';

  // modules
  var CurveFittingModel = require( 'CURVE_FITTING/curve-fitting/model/CurveFittingModel' );
  var CurveFittingScreenView = require( 'CURVE_FITTING/curve-fitting/view/CurveFittingScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var curveFittingSimString = require( 'string!CURVE_FITTING/curve-fitting.name' );

  /**
   * @constructor
   */
  function CurveFittingScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    Screen.call( this, curveFittingSimString, icon,
      function() { return new CurveFittingModel(); },
      function( model ) { return new CurveFittingScreenView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, CurveFittingScreen );
} );