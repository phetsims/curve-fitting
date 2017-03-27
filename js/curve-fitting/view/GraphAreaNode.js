// Copyright 2015-2016, University of Colorado Boulder

//TODO rename, untangle
/**
 * Graph area node in 'Curve Fitting' simulation.
 * Contains graph area, curve and panel with equation parameters.
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
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var AXIS_OPTIONS = {
    lineWidth: 1,
    stroke: 'black'
  };
  var TICK_LENGTH = 0.3; // in model coordinate
  var HORIZONTAL_TICKS = [ -10, -5, 5, 10 ];
  var VERTICAL_TICKS = [ -10, -5, 5, 10 ];

  /**
   * @param {Curve} curve - curve model.
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {Bounds2} graphBounds -  bounds of the graph, in model coordinate frame
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function GraphAreaNode( curve, residualsVisibleProperty, curveVisibleProperty, graphBounds, modelViewTransform ) {

    Node.call( this );

    // create and add white background
    this.addChild( new Rectangle.bounds( modelViewTransform.modelToViewBounds( graphBounds ), {
      fill: 'white',
      lineWidth: 2,
      stroke: 'rgb( 214, 223, 226 )'
    } ) );

    var axisShape = new Shape();

    // create X axis
    axisShape.moveTo( graphBounds.minX, 0 ).horizontalLineTo( graphBounds.maxX );

    // create Y axis
    axisShape.moveTo( 0, graphBounds.minY ).verticalLineTo( graphBounds.maxY );

    // add axes
    this.addChild( new Path( modelViewTransform.modelToViewShape( axisShape ), AXIS_OPTIONS ) );

    var ticksShape = new Shape();

    // create horizontal tick lines
    this.addTicks( ticksShape, HORIZONTAL_TICKS );

    // create vertical tick lines
    this.addTicks( ticksShape, VERTICAL_TICKS, { axis: 'vertical' } );

    // add ticks
    this.addChild( new Path( modelViewTransform.modelToViewShape( ticksShape ), AXIS_OPTIONS ) );

    // add clip area
    this.clipArea = Shape.bounds( modelViewTransform.modelToViewBounds( graphBounds ) );

    // create and add curve
    var curvePath = new Path( null, { stroke: 'black', lineWidth: 2 } );
    this.addChild( curvePath );

    // create and add residual lines
    var residualsPath = new Path( null, { stroke: CurveFittingConstants.GRAY_COLOR, lineWidth: 2 } );
    this.addChild( residualsPath );


    /**
     * updates the shape of the curve and the residuals
     */
    var updateShape = function() {
      var curveShape = null;
      var residualsShape = null;
      var order = curve.orderProperty.value;
      var points = curve.getPoints();
      var a = curve.a;
      var b = curve.b;
      var c = curve.c;
      var d = curve.d;

      // ensure the order is 1, 2 or 3, linear, quadratic or cubic
      assert && assert( order === 1 || order === 2 || order === 3, 'invalid order: ' + order );

      //TODO This expression looks suspect, or at least overly complicated. Simplify or document.
      //TODO curve.fitProperty is private, should not be assigned here!!
      if ( ( points.length > 1 || curve.fitProperty.value === 'adjustable' ) && !isNaN( a ) && !isNaN( b ) && !isNaN( c ) && !isNaN( d ) ) {

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

          points.forEach( function( point ) {
            //TODO why is this not testing for a specific order value?
            if ( order ) {
              residualsShape.moveToPoint( point.position );
              residualsShape.verticalLineTo( curve.getYValueAt( point.position.x ) );
            }
          } );
        }
      }
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
    curve.orderProperty.lazyLink( updateShape );
    residualsVisibleProperty.link( updateShape );
    curve.updateCurveEmitter.addListener( updateShape );
  }

  curveFitting.register( 'GraphAreaNode', GraphAreaNode );

  return inherit( Node, GraphAreaNode, {
    /**
     * @private
     * @param {Shape} shape
     * @param {number} location
     * @param {Object} options
     */
    addTick: function( shape, location, options ) {
      options = _.extend(
        {
          axis: 'horizontal'
        }, options );

      if ( options.axis === 'horizontal' ) {
        shape.moveTo( location, -TICK_LENGTH / 2 ); // ticks are below and above x-axis
        shape.verticalLineToRelative( TICK_LENGTH );
      }
      else {
        shape.moveTo( -TICK_LENGTH / 2, location );
        shape.horizontalLineToRelative( TICK_LENGTH );
      }
    },
    /**
     * @private
     * @param  {Shape} shape
     * @param {Array.<number>} ticksLocation - in model coordinates
     * @param {Object} options
     */
    addTicks: function( shape, ticksLocation, options ) {
      var self = this;

      ticksLocation.forEach( function( location ) {
        self.addTick( shape, location, options );
      } );
    }

  } );
} )
;