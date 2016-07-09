// Copyright 2015, University of Colorado Boulder

/**
 * Constants used in multiple locations within the 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (MLearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var Bounds2 = require( 'DOT/Bounds2' );

  var CurveFittingConstants = {
    // speed for dataPoints to reach the bucket when animated
    ANIMATION_SPEED: 0.1, //  in model units per millisecond;

    MAX_ORDER_OF_FIT: 3,

    // barometer
    BAROMETER_HEIGHT: 270,
    BAROMETER_TICK_WIDTH: 15,

    // colors
    BLUE_COLOR: 'rgb( 19, 52, 248 )',
    GRAY_COLOR: 'rgb( 107, 107, 107 )',
    LIGHT_GRAY_COLOR: 'rgb( 201, 201, 202 )',

    // point
    POINT_FILL: 'rgb( 252, 151, 64 )',
    POINT_RADIUS: 6,
    POINT_STROKE: 'black',
    POINT_LINE_WIDTH: 1,

    // panels
    PANEL_BACKGROUND_COLOR: 'rgb( 254, 235, 214 )',
    PANEL_CORNER_RADIUS: 5,
    PANEL_MARGIN: 10,
    PANEL_WIDTH: 130,
    PANEL_MAX_WIDTH: 151,

    // size
    SIM_BOUNDS: new Bounds2( 0, 0, 768, 504 ),
    GRAPH_MODEL_BOUNDS: new Bounds2( -10, -10, 10, 10 )
  };

  curveFitting.register( 'CurveFittingConstants', CurveFittingConstants );

  return CurveFittingConstants;
} );