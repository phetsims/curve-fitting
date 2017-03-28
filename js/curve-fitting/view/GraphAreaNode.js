// Copyright 2015-2016, University of Colorado Boulder

//TODO rename, untangle
/**
 * Graph area node in 'Curve Fitting' simulation.
 * Contains graph area and curve with residual lines
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
  var CURVE_OPTIONS = { stroke: 'black', lineWidth: 2 };
  var RESIDUAL_OPTIONS = { stroke: CurveFittingConstants.GRAY_COLOR, lineWidth: 2 };
  var GRAPH_BACKGROUND_OPTIONS = { fill: 'white', lineWidth: 2, stroke: 'rgb( 214, 223, 226 )' };

  // ticks
  var TICK_LENGTH = 0.3; // in model coordinate
  var HORIZONTAL_TICKS = [ -10, -5, 5, 10 ];
  var VERTICAL_TICKS = [ -10, -5, 5, 10 ];
  var TICK_DECIMAL_PLACES = 0;
  var TICK_FONT_OPTIONS = { font: new PhetFont( 12 ), fill: 'black' };


  /**
   * @param {Points} points
   * @param {Curve} curve - curve model.
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function GraphAreaNode( points, curve, residualsVisibleProperty, curveVisibleProperty, modelViewTransform ) {

    Node.call( this );

    this.modelViewTransform = modelViewTransform;

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

    // create and add curve
    var curvePath = new Path( null, CURVE_OPTIONS );
    this.addChild( curvePath );

    // create and add residual lines
    var residualsPath = new Path( null, RESIDUAL_OPTIONS );
    this.addChild( residualsPath );


    /**
     * updates the shape of the curve and the residuals
     */
    var updateShape = function() {
      var curveShape = null;
      var residualsShape = null;
      var pointsOnGraph = points.getPointsOnGraph();
      var order = curve.orderProperty.value;
      var a = curve.a;
      var b = curve.b;
      var c = curve.c;
      var d = curve.d;

      // ensure the order is 1, 2 or 3, linear, quadratic or cubic
      assert && assert( order === 1 || order === 2 || order === 3, 'invalid order: ' + order );

      //TODO This expression looks suspect, or at least overly complicated. Simplify or document.
      //TODO curve.fitProperty is private, should not be assigned here!!
      if ( ( pointsOnGraph.length > 1 || curve.fitProperty.value === 'adjustable' ) && !isNaN( a ) && !isNaN( b ) && !isNaN( c ) && !isNaN( d ) ) {

        // convenience variables
        var xMin = graphBounds.minX; // minimum value of the x range
        var xMax = graphBounds.maxX; // maximum value of the x range
        var yAtXMin = curve.getYValueAt( xMin );
        var yAtXMax = curve.getYValueAt( xMax );

        // update curve path
        curveShape = new Shape();
        curveShape.moveTo( xMin, yAtXMin );

        // curve is a line, quadratic or cubic depending on the order of the fit.
        switch( order ) {
          case 3:
            // use bezier curve : must determine the control points
            // note that the curve will not go through the control points.
            var cp1x = (2 * xMin + xMax) / 3; // one third of the way between xMmin and xMax
            var cp2x = (xMin + 2 * xMax) / 3; // two third of the way between xMmin and xMax
            var cp1y = a * xMax * xMin * xMin + b * (xMin + 2 * xMax) * xMin / 3 + c * (2 * xMin + xMax) / 3 + d;
            var cp2y = a * xMin * xMax * xMax + b * (xMax + 2 * xMin) * xMax / 3 + c * (2 * xMax + xMin) / 3 + d;
            curveShape.cubicCurveTo( cp1x, cp1y, cp2x, cp2y, xMax, yAtXMax );
            break;
          case 2:
            // use bezier curve : must determine the control point
            // note that the curve will not go through the control point.
            var cpx = (xMin + xMax) / 2; // point halfway between xMin and xMax
            var cpy = b * xMin * xMax + c * (xMax + xMin) / 2 + d;
            curveShape.quadraticCurveTo( cpx, cpy, xMax, yAtXMax );
            break;
          default:
            curveShape.lineTo( xMax, yAtXMax );
            break;
        }

        // update path residuals, i.e. vertical line connecting data point to curve
        if ( residualsVisibleProperty.value ) {
          residualsShape = new Shape();

          pointsOnGraph.forEach( function( point ) {
            residualsShape.moveToPoint( point.position );
            residualsShape.verticalLineTo( curve.getYValueAt( point.position.x ) );
          } );
        }
      } // end of if statement

      if ( curveShape ) {
        curvePath.setShape( modelViewTransform.modelToViewShape( curveShape ) );
      }
      else {
        curvePath.setShape( null );
      }
      if ( residualsShape ) {
        residualsPath.setShape( modelViewTransform.modelToViewShape( residualsShape ) );
      }
      else {
        residualsPath.setShape( null );
      }
    };

    curveVisibleProperty.linkAttribute( curvePath, 'visible' );
    residualsVisibleProperty.link( updateShape );
    curve.orderProperty.lazyLink( updateShape );
    curve.updateCurveEmitter.addListener( updateShape );
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
        tickShape.moveTo( location, -TICK_LENGTH / 2 ); // ticks are below and above x-axis
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