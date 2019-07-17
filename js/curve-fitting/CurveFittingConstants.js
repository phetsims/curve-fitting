// Copyright 2015-2019, University of Colorado Boulder

/**
 * Constants used in multiple locations within the 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (MLearner)
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RangeWithValue = require( 'DOT/RangeWithValue' );

  const CurveFittingConstants = {

    SCREEN_VIEW_OPTIONS: { layoutBounds: new Bounds2( 0, 0, 768, 504 ) },

    // speed for dataPoints to reach the bucket when animated
    ANIMATION_SPEED: 65, // in model units per second;

    MAX_ORDER_OF_FIT: 3,

    // barometer
    BAROMETER_BAR_WIDTH: 10,
    BAROMETER_AXIS_HEIGHT: 270,
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
    PANEL_MIN_WIDTH: 151,

    RADIO_BUTTON_OPTIONS: {
      radius: 6,
      touchAreaXDilation: 5
    },

    CONTROL_TEXT_OPTIONS: {
      font: new PhetFont( 12 )
    },

    CHECK_BOX_OPTIONS: {
      boxWidth: 14
    },

    // sliders
    CONSTANT_RANGE: new RangeWithValue( -10, 10, 2.7 ),
    LINEAR_RANGE: new RangeWithValue( -2, 2, 0 ),
    QUADRATIC_RANGE: new RangeWithValue( -1, 1, 0 ),
    CUBIC_RANGE: new RangeWithValue( -1, 1, 0 ),

    // size of the graph node in model coordinates (including axes and labels)
    GRAPH_NODE_MODEL_BOUNDS: new Bounds2( -11, -11, 11, 11 ),

    //size of the graph in model coordinates (just the white background)
    GRAPH_BACKGROUND_MODEL_BOUNDS: new Bounds2( -10, -10, 10, 10 )
  };

  curveFitting.register( 'CurveFittingConstants', CurveFittingConstants );

  return CurveFittingConstants;
} );