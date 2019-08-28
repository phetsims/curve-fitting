// Copyright 2015-2019, University of Colorado Boulder

/**
 * Main screen in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (MLearner)
 */
define( require => {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingModel = require( 'CURVE_FITTING/curve-fitting/model/CurveFittingModel' );
  const CurveFittingScreenView = require( 'CURVE_FITTING/curve-fitting/view/CurveFittingScreenView' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );

  class CurveFittingScreen extends Screen {

    constructor() {
      super(
        () => new CurveFittingModel(),
        model => new CurveFittingScreenView( model ),
        { backgroundColorProperty: new Property( 'rgb( 187, 230, 246 )' ) }
      );
    }

  }

  return curveFitting.register( 'CurveFittingScreen', CurveFittingScreen );
} );
