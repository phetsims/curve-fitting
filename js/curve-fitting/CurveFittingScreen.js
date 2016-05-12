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
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var curveFittingTitleString = require( 'string!CURVE_FITTING/curve-fitting.title' );

  /**
   * @constructor
   */
  function CurveFittingScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    // model coordinates are the same as view coordinates
    var modelViewTransform = ModelViewTransform2.createIdentity();

    Screen.call( this, curveFittingTitleString, icon,
      function() { return new CurveFittingModel(); },
      function( model ) { return new CurveFittingView( model, modelViewTransform ); },
      { backgroundColor: 'rgb( 187, 230, 246 )' }
    );
  }

  curveFitting.register( 'CurveFittingScreen', CurveFittingScreen );

  return inherit( Screen, CurveFittingScreen );
} );