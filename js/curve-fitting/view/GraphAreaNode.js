// Copyright 2015-2022, University of Colorado Boulder

/**
 * Graph area node in 'Curve Fitting' simulation.
 * Contains static graph area with axes, tick lines and labels
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */

import { Shape } from '../../../../kite/js/imports.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingStrings from '../../CurveFittingStrings.js';
import CurveFittingConstants from '../CurveFittingConstants.js';

const xSymbolString = CurveFittingStrings.xSymbol;
const ySymbolString = CurveFittingStrings.ySymbol;

// constants
const AXIS_OPTIONS = { lineWidth: 1, stroke: 'black' };
const GRAPH_BACKGROUND_OPTIONS = { fill: 'white', stroke: 'rgb( 214, 223, 226 )' };

// information regarding ticks and axes; all distances and lengths are in model coordinates
const MINOR_TICK_LENGTH = 0.3;
const MAJOR_TICK_LENGTH = 0.75;
const MAJOR_TICK_POSITIONS = [ -10, -5, 5, 10 ];
const TICK_LABEL_FONT = CurveFittingConstants.GRAPH_TICK_LABEL_FONT;
const TICK_LABEL_DISTANCE_FROM_AXES = 0.5;
const AXIS_LABEL_DISTANCE_FROM_AXES = 0.2;
const AXIS_LABEL_FONT = CurveFittingConstants.GRAPH_AXIS_LABEL_FONT;
const AXIS_LABEL_MAX_WIDTH = 20;
const AXIS_ARROW_OPTIONS = {
  doubleHead: true,
  tailWidth: 0,
  headWidth: 5,
  headHeight: 5
};

class GraphAreaNode extends Node {

  /**
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( modelViewTransform ) {

    super();

    // convenience variable, white background bounds for graph in model coordinates
    const backgroundBounds = CurveFittingConstants.GRAPH_BACKGROUND_MODEL_BOUNDS;

    // convenience variable, graph node bounds in model coordinates.
    const graphBounds = CurveFittingConstants.GRAPH_NODE_MODEL_BOUNDS;

    // convenience variable, curve bounds in model coordinates
    const axesBounds = CurveFittingConstants.GRAPH_AXES_BOUNDS;

    // create and add white background
    this.addChild( Rectangle.bounds(
      modelViewTransform.modelToViewBounds( backgroundBounds ),
      GRAPH_BACKGROUND_OPTIONS
    ) );

    // axes
    const axisShape = new Shape();
    axisShape.moveTo( axesBounds.minX, 0 ).horizontalLineTo( axesBounds.maxX );
    axisShape.moveTo( 0, axesBounds.minY ).verticalLineTo( axesBounds.maxY );

    // ticks: assumes that backgroundBounds is a square
    for ( let i = backgroundBounds.minX; i <= backgroundBounds.maxX; i++ ) {
      let tickLength = MINOR_TICK_LENGTH;
      if ( _.includes( MAJOR_TICK_POSITIONS, i ) ) {
        tickLength = MAJOR_TICK_LENGTH;
      }
      axisShape.moveTo( i, -tickLength / 2 );
      axisShape.lineTo( i, tickLength / 2 );
      axisShape.moveTo( -tickLength / 2, i );
      axisShape.lineTo( tickLength / 2, i );
    }
    this.addChild( new Path( modelViewTransform.modelToViewShape( axisShape ), AXIS_OPTIONS ) );

    // tick labels
    MAJOR_TICK_POSITIONS.forEach( tickPosition => {
      this.addChild( new Text( tickPosition, {
        font: TICK_LABEL_FONT,
        centerX: modelViewTransform.modelToViewX( tickPosition ),
        top: modelViewTransform.modelToViewY( -TICK_LABEL_DISTANCE_FROM_AXES )
      } ) );
      this.addChild( new Text( tickPosition, {
        font: TICK_LABEL_FONT,
        centerY: modelViewTransform.modelToViewY( tickPosition ),
        right: modelViewTransform.modelToViewX( -TICK_LABEL_DISTANCE_FROM_AXES )
      } ) );
    } );

    // axis labels
    this.addChild( new Text( xSymbolString, {
      font: AXIS_LABEL_FONT,
      maxWidth: AXIS_LABEL_MAX_WIDTH,
      centerY: modelViewTransform.modelToViewY( 0 ),
      left: modelViewTransform.modelToViewX( axesBounds.maxX + AXIS_LABEL_DISTANCE_FROM_AXES )
    } ) );
    this.addChild( new Text( ySymbolString, {
      font: AXIS_LABEL_FONT,
      maxWidth: AXIS_LABEL_MAX_WIDTH,
      centerX: modelViewTransform.modelToViewX( 0 ),
      bottom: modelViewTransform.modelToViewY( axesBounds.maxY + AXIS_LABEL_DISTANCE_FROM_AXES )
    } ) );

    // axis arrows
    this.addChild( new ArrowNode(
      modelViewTransform.modelToViewX( axesBounds.minX ),
      modelViewTransform.modelToViewY( 0 ),
      modelViewTransform.modelToViewX( axesBounds.maxX ),
      modelViewTransform.modelToViewY( 0 ),
      AXIS_ARROW_OPTIONS
    ) );
    this.addChild( new ArrowNode(
      modelViewTransform.modelToViewX( 0 ),
      modelViewTransform.modelToViewY( axesBounds.minY ),
      modelViewTransform.modelToViewX( 0 ),
      modelViewTransform.modelToViewY( axesBounds.maxY ),
      AXIS_ARROW_OPTIONS
    ) );

    // add clip area
    this.clipArea = Shape.bounds( modelViewTransform.modelToViewBounds( graphBounds ) );

  }

}

curveFitting.register( 'GraphAreaNode', GraphAreaNode );
export default GraphAreaNode;
