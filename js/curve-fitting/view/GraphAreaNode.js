// Copyright 2015-2019, University of Colorado Boulder

/**
 * Graph area node in 'Curve Fitting' simulation.
 * Contains static graph area with axes, tick lines and labels
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( require => {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );

  // strings
  const symbolXString = require( 'string!CURVE_FITTING/symbol.x' );
  const symbolYString = require( 'string!CURVE_FITTING/symbol.y' );

  // constants
  const AXIS_OPTIONS = { lineWidth: 1, stroke: 'black' };
  const GRAPH_BACKGROUND_OPTIONS = { fill: 'white', lineWidth: 2, stroke: 'rgb( 214, 223, 226 )' };

  // tick information in model coordinates
  const TICK_LENGTH = 0.3;
  const HORIZONTAL_TICK_LOCATIONS = [ -10, -5, 5, 10 ];
  const VERTICAL_TICK_LOCATIONS = [ -10, -5, 5, 10 ];
  const TICK_DECIMAL_PLACES = 0;
  const TICK_FONT_OPTIONS = { font: new PhetFont( 12 ), fill: 'black' };
  const TICK_LABEL_DISTANCE_FROM_AXES = 3; // in view coordinates
  const AXIS_LABEL_FONT = new MathSymbolFont( 12 );

  class GraphAreaNode extends Node {

    /**
     * @param {ModelViewTransform2} modelViewTransform
     */
    constructor( modelViewTransform ) {

      super();

      // @private
      this.modelViewTransform = modelViewTransform;

      // convenience variable, graph node bounds in model coordinates.
      const graphBounds = CurveFittingConstants.GRAPH_NODE_MODEL_BOUNDS;

      // convenience variable, curve bounds in model coordinates
      const curveBounds = CurveFittingConstants.CURVE_CLIP_BOUNDS;

      // create and add white background
      this.addChild( new Rectangle.bounds(
        modelViewTransform.modelToViewBounds( CurveFittingConstants.GRAPH_BACKGROUND_MODEL_BOUNDS ),
        GRAPH_BACKGROUND_OPTIONS
      ) );

      const axisShape = new Shape();

      // create X axis
      axisShape.moveTo( curveBounds.minX, 0 ).horizontalLineTo( curveBounds.maxX );

      // create Y axis
      axisShape.moveTo( 0, curveBounds.minY ).verticalLineTo( curveBounds.maxY );

      // add axes
      this.addChild( new Path( modelViewTransform.modelToViewShape( axisShape ), AXIS_OPTIONS ) );

      // create and add horizontal tick lines and labels
      this.addTicks( HORIZONTAL_TICK_LOCATIONS );

      // create and add vertical tick lines and labels
      this.addTicks( VERTICAL_TICK_LOCATIONS, { axis: 'vertical' } );

      // axis labels
      this.addChild( new Text( symbolXString, {
        font: AXIS_LABEL_FONT,
        centerY: modelViewTransform.modelToViewY( 0 ),
        left: modelViewTransform.modelToViewX( 11.2 )
      } ) );
      this.addChild( new Text( symbolYString, {
        font: AXIS_LABEL_FONT,
        centerX: modelViewTransform.modelToViewX( 0 ),
        bottom: modelViewTransform.modelToViewY( 11.2 )
      } ) );

      //TODO: axis arrows

      // add clip area
      this.clipArea = Shape.bounds( modelViewTransform.modelToViewBounds( graphBounds ) );

    }

    /***
     * create and add a tick line
     * @param {number} location
     * @param {Object} [options]
     * @private
     */
    addTickLine( location, options ) {
      options = _.extend( {
        axis: 'horizontal'
      }, options );

      const tickShape = new Shape();

      if ( options.axis === 'horizontal' ) {
        tickShape.moveTo( location, -TICK_LENGTH / 2 ); // tick lines are straddling the x-axis
        tickShape.verticalLineToRelative( TICK_LENGTH );
      }
      else {
        tickShape.moveTo( -TICK_LENGTH / 2, location );
        tickShape.horizontalLineToRelative( TICK_LENGTH );
      }
      this.addChild( new Path( this.modelViewTransform.modelToViewShape( tickShape ), AXIS_OPTIONS ) );
    }

    /**
     * create and add a tick label
     * @param {number} value
     * @param {Object} [options]
     */
    addTickLabel( value, options ) {
      options = _.extend( {
        axis: 'horizontal'
      }, options );

      const tickLabel = new Text( Util.toFixed( value, TICK_DECIMAL_PLACES ), TICK_FONT_OPTIONS );

      if ( options.axis === 'horizontal' ) {
        tickLabel.centerX = this.modelViewTransform.modelToViewX( value );
        tickLabel.top = this.modelViewTransform.modelToViewY( -TICK_LENGTH / 2 ) + TICK_LABEL_DISTANCE_FROM_AXES;
      }
      else {
        tickLabel.centerY = this.modelViewTransform.modelToViewY( value );
        tickLabel.right = this.modelViewTransform.modelToViewX( -TICK_LENGTH / 2 ) - TICK_LABEL_DISTANCE_FROM_AXES;
      }
      this.addChild( tickLabel );
    }

    /**
     * create and add ticks and labels
     * @param {Array.<number>} ticksLocation - in model coordinates
     * @param {Object} [options]
     * @private
     */
    addTicks( ticksLocation, options ) {
      ticksLocation.forEach( location => {
        this.addTickLine( location, options );
        this.addTickLabel( location, options );
      } );
    }

  }

  curveFitting.register( 'GraphAreaNode', GraphAreaNode );

  return GraphAreaNode;
} );