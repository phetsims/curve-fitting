// Copyright 2015-2016, University of Colorado Boulder

/**
 * Main screen in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (MLearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingModel = require( 'CURVE_FITTING/curve-fitting/model/CurveFittingModel' );
  var CurveFittingScreenView = require( 'CURVE_FITTING/curve-fitting/view/CurveFittingScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var curveFittingTitleString = require( 'string!CURVE_FITTING/curve-fitting.title' );

  /**
   * @constructor
   */
  function CurveFittingScreen() {

    Screen.call( this,
      curveFittingTitleString,
      null, // single-screen sim, no icon necessary
      function() { return new CurveFittingModel(); },
      function( model ) { return new CurveFittingScreenView( model ); },
      { backgroundColor: 'rgb( 187, 230, 246 )' }
    );
  }

  curveFitting.register( 'CurveFittingScreen', CurveFittingScreen );

  return inherit( Screen, CurveFittingScreen );
} );