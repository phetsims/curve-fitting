// Copyright 2015-2016, University of Colorado Boulder

/**
 * Graph area node in 'Curve Fitting' simulation.
 * Contains static graph area with axes, tick lines and labels
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // constants
  var AXIS_OPTIONS = { lineWidth: 1, stroke: 'black' };
  var GRAPH_BACKGROUND_OPTIONS = { fill: 'white', lineWidth: 2, stroke: 'rgb( 214, 223, 226 )' };

  // ticks
  var TICK_LENGTH = 0.3; // in model coordinate
  var HORIZONTAL_TICKS = [ -10, -5, 5, 10 ];
  var VERTICAL_TICKS = [ -10, -5, 5, 10 ];
  var TICK_DECIMAL_PLACES = 0;
  var TICK_FONT_OPTIONS = { font: new PhetFont( 12 ), fill: 'black' };

  /**
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function GraphAreaNode( modelViewTransform ) {

    Node.call( this );

    // @private
    this.modelViewTransform = modelViewTransform;

    // convenience variable, graph bound in model coordinates.
    var graphBounds = CurveFittingConstants.GRAPH_MODEL_BOUNDS;

    // create and add white background
    this.addChild( new Rectangle.bounds( modelViewTransform.modelToViewBounds( graphBounds ), GRAPH_BACKGROUND_OPTIONS ) );

    var axisShape = new Shape();

    // create X axis
    axisShape.moveTo( graphBounds.minX, 0 ).horizontalLineTo( graphBounds.maxX );

    // create Y axis
    axisShape.moveTo( 0, graphBounds.minY ).verticalLineTo( graphBounds.maxY );

    // add axes
    this.addChild( new Path( modelViewTransform.modelToViewShape( axisShape ), AXIS_OPTIONS ) );

    // create and add horizontal tick lines and labels
    this.addTicks( HORIZONTAL_TICKS );

    // create and add vertical tick lines and labels
    this.addTicks( VERTICAL_TICKS, { axis: 'vertical' } );

    // add clip area
    this.clipArea = Shape.bounds( modelViewTransform.modelToViewBounds( graphBounds ) );

  }

  curveFitting.register( 'GraphAreaNode', GraphAreaNode );

  return inherit( Node, GraphAreaNode, {
    /***
     * create and add a tick line
     * @param {number} location
     * @param {Object} [options]
     * @private
     */
    addTickLine: function( location, options ) {
      options = _.extend(
        {
          axis: 'horizontal'
        }, options );

      var tickShape = new Shape();

      if ( options.axis === 'horizontal' ) {
        tickShape.moveTo( location, -TICK_LENGTH / 2 ); // tick lines are straddling the x-axis
        tickShape.verticalLineToRelative( TICK_LENGTH );
      }
      else {
        tickShape.moveTo( -TICK_LENGTH / 2, location );
        tickShape.horizontalLineToRelative( TICK_LENGTH );
      }
      this.addChild( new Path( this.modelViewTransform.modelToViewShape( tickShape ), AXIS_OPTIONS ) );
    },

    /**
     * create and add a tick label
     * @param {number} value
     * @param {Object} [options]
     */
    tickLabel: function( value, options ) {
      options = _.extend(
        {
          axis: 'horizontal'
        }, options );

      var tickLabel = new Text( Util.toFixed( value, TICK_DECIMAL_PLACES ), TICK_FONT_OPTIONS );

      if ( options.axis === 'horizontal' ) {
        tickLabel.centerX = this.modelViewTransform.modelToViewX( value );
        tickLabel.top = this.modelViewTransform.modelToViewY( -TICK_LENGTH / 2 );
      }
      else {
        tickLabel.centerY = this.modelViewTransform.modelToViewY( value );
        tickLabel.right = this.modelViewTransform.modelToViewX( -TICK_LENGTH / 2 );
      }
      this.addChild( tickLabel );
    },

    /**
     * create and add ticks and labels
     * @param {Array.<number>} ticksLocation - in model coordinates
     * @param {Object} [options]
     * @private
     */
    addTicks: function( ticksLocation, options ) {

      options = _.extend(
        {
          withLabels: true
        }, options );

      var self = this;

      ticksLocation.forEach( function( location ) {
        self.addTickLine( location, options );
        if ( options.withLabels ) {
          self.tickLabel( location, options );
        }
      } );
    }
  } );
} );