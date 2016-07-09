// Copyright 2015, University of Colorado Boulder

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
  var CurveFittingView = require( 'CURVE_FITTING/curve-fitting/view/CurveFittingView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var curveFittingTitleString = require( 'string!CURVE_FITTING/curve-fitting.title' );

  /**
   * @constructor
   */
  function CurveFittingScreen() {

    // Since this is a single-screen sim, then no icon is necessary.
    var icon = null;

    Screen.call( this, curveFittingTitleString, icon,
      function() { return new CurveFittingModel(); },
      function( model ) { return new CurveFittingView( model ); },
      { backgroundColor: 'rgb( 187, 230, 246 )' }
    );
  }

  curveFitting.register( 'CurveFittingScreen', CurveFittingScreen );

  return inherit( Screen, CurveFittingScreen );
} );