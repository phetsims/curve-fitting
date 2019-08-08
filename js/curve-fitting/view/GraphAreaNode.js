// Copyright 2015-2019, University of Colorado Boulder

/**
 * Graph area node in 'Curve Fitting' simulation.
 * Contains static graph area with axes, tick lines and labels
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  const symbolXString = require( 'string!CURVE_FITTING/symbol.x' );
  const symbolYString = require( 'string!CURVE_FITTING/symbol.y' );

  // constants
  const AXIS_OPTIONS = { lineWidth: 1, stroke: 'black' };
  const GRAPH_BACKGROUND_OPTIONS = { fill: 'white', stroke: 'rgb( 214, 223, 226 )' };

  // information regarding ticks and axes; all distances and lengths are in model coordinates
  const MINOR_TICK_LENGTH = 0.3;
  const MAJOR_TICK_LENGTH = 0.75;
  const MAJOR_TICK_LOCATIONS = [ -10, -5, 5, 10 ];
  const TICK_LABEL_FONT = new PhetFont( 12 );
  const TICK_LABEL_DISTANCE_FROM_AXES = 0.5;
  const AXIS_LABEL_DISTANCE_FROM_AXES = 0.2;
  const AXIS_LABEL_FONT = new MathSymbolFont( { size: 12, weight: 'bold' } );
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
      this.addChild( new Rectangle.bounds(
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
        if ( _.includes( MAJOR_TICK_LOCATIONS, i ) ) {
          tickLength = MAJOR_TICK_LENGTH;
        }
        axisShape.moveTo( i, -tickLength / 2 );
        axisShape.lineTo( i, tickLength / 2 );
        axisShape.moveTo( -tickLength / 2, i );
        axisShape.lineTo( tickLength / 2, i );
      }
      this.addChild( new Path( modelViewTransform.modelToViewShape( axisShape ), AXIS_OPTIONS ) );

      // tick labels
      MAJOR_TICK_LOCATIONS.forEach( tickLocation => {
        this.addChild( new Text( tickLocation, {
          font: TICK_LABEL_FONT,
          centerX: modelViewTransform.modelToViewX( tickLocation ),
          top: modelViewTransform.modelToViewY( -TICK_LABEL_DISTANCE_FROM_AXES )
        } ) );
        this.addChild( new Text( tickLocation, {
          font: TICK_LABEL_FONT,
          centerY: modelViewTransform.modelToViewY( tickLocation ),
          right: modelViewTransform.modelToViewX( -TICK_LABEL_DISTANCE_FROM_AXES )
        } ) );
      } );

      // axis labels
      this.addChild( new Text( symbolXString, {
        font: AXIS_LABEL_FONT,
        centerY: modelViewTransform.modelToViewY( 0 ),
        left: modelViewTransform.modelToViewX( axesBounds.maxX + AXIS_LABEL_DISTANCE_FROM_AXES )
      } ) );
      this.addChild( new Text( symbolYString, {
        font: AXIS_LABEL_FONT,
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

  return GraphAreaNode;
} );