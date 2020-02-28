// Copyright 2015-2020, University of Colorado Boulder

/**
 * Constants used in multiple locations within the 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (MLearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import RangeWithValue from '../../../dot/js/RangeWithValue.js';
import MathSymbolFont from '../../../scenery-phet/js/MathSymbolFont.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import curveFitting from '../curveFitting.js';

// constants
const EQUATION_FONT_SIZE = 16;

const CurveFittingConstants = {

  // speed for dataPoints to reach the bucket when animated
  ANIMATION_SPEED: 65, // in model units per second;

  MAX_ORDER_OF_FIT: 3,

  // barometers
  BAROMETER_BAR_WIDTH: 10,
  BAROMETER_AXIS_HEIGHT: 270,
  BAROMETER_TICK_WIDTH: 15,

  // colors
  BLUE_COLOR: 'rgb( 19, 52, 248 )',
  GRAY_COLOR: 'rgb( 107, 107, 107 )',
  LIGHT_GRAY_COLOR: 'rgb( 201, 201, 202 )',

  // points
  POINT_FILL: 'rgb( 252, 151, 64 )',
  POINT_RADIUS: 8,
  POINT_STROKE: 'black',
  POINT_LINE_WIDTH: 1,

  // panels
  PANEL_BACKGROUND_COLOR: 'rgb( 254, 235, 214 )',
  PANEL_CORNER_RADIUS: 5,
  PANEL_MAX_WIDTH: 180,
  PANEL_MIN_WIDTH: 180,

  // radio buttons
  RADIO_BUTTON_OPTIONS: {
    radius: 7,
    touchAreaXDilation: 5
  },

  // checkboxes
  CHECKBOX_OPTIONS: {
    boxWidth: 14
  },

  // sliders
  CONSTANT_RANGE: new RangeWithValue( -10, 10, 2.7 ),
  LINEAR_RANGE: new RangeWithValue( -2, 2, 0 ),
  QUADRATIC_RANGE: new RangeWithValue( -1, 1, 0 ),
  CUBIC_RANGE: new RangeWithValue( -1, 1, 0 ),

  // size of the graph node in model coordinates (including axes and labels)
  GRAPH_NODE_MODEL_BOUNDS: new Bounds2( -12, -12, 12, 12 ),

  // bounds for the graph axes
  GRAPH_AXES_BOUNDS: new Bounds2( -10.75, -10.75, 10.75, 10.75 ),

  // size of the graph in model coordinates (just the white background)
  GRAPH_BACKGROUND_MODEL_BOUNDS: new Bounds2( -10, -10, 10, 10 ),

  // clipping bounds for the drawn curve in model coordinates
  CURVE_CLIP_BOUNDS: new Bounds2( -10, -10, 10, 10 ),

  // margins
  SCREEN_VIEW_X_MARGIN: 20,
  SCREEN_VIEW_Y_MARGIN: 12,
  PANEL_MARGIN: 10,

  // spacing
  CONTROLS_Y_SPACING: 12,
  SLIDERS_X_SPACING: 15,

  // fonts
  CONTROL_FONT: new PhetFont( 16 ),
  COEFFICIENT_FONT: new PhetFont( { size: EQUATION_FONT_SIZE, weight: 'bold' } ),
  EQUATION_SYMBOL_FONT: new MathSymbolFont( EQUATION_FONT_SIZE ),
  EQUATION_NORMAL_FONT: new PhetFont( EQUATION_FONT_SIZE ),
  ACCORDION_BOX_TITLE_FONT: new PhetFont( 16 ),
  GRAPH_TICK_LABEL_FONT: new PhetFont( 14 ),
  GRAPH_AXIS_LABEL_FONT: new MathSymbolFont( 16 ),
  BAROMETER_TICK_LABEL_FONT: new PhetFont( 14 ),
  BAROMETER_VALUE_FONT: new PhetFont( 14 ),
  BAROMETER_SYMBOL_FONT: new MathSymbolFont( 16 ),
  POINT_VALUE_FONT: new PhetFont( 14 ),
  INFO_DIALOG_NORMAL_FONT: new PhetFont( 14 ),
  INFO_DIALOG_SYMBOL_FONT: new MathSymbolFont( 14 )
};

curveFitting.register( 'CurveFittingConstants', CurveFittingConstants );
export default CurveFittingConstants;