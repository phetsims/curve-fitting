// Copyright 2015-2016, University of Colorado Boulder

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
  var Fit = require( 'CURVE_FITTING/curve-fitting/model/Fit' );
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
  var PLOT_STEP = 0.1;
  var TICK_LENGTH = 7;

  /**
   * @param {Curve} curve - curve model.
   * @param {Property.<number>} orderProperty
   * @param {Property.<boolean>} areResidualsVisibleProperty - Property to track residuals visibility.
   * @param {Bounds2} graphModelBounds -  bounds of the graph
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function GraphAreaNode( curve, orderProperty, areResidualsVisibleProperty, graphModelBounds, modelViewTransform, options ) {

    Node.call( this, options );

    // determine the graph are bounds in the view
    var graphViewBounds = modelViewTransform.modelToViewBounds( graphModelBounds );

    // create and add white background
    this.addChild( new Rectangle.bounds( graphViewBounds, {
      fill: 'white',
      lineWidth: 2,
      stroke: 'rgb( 214, 223, 226 )'
    } ) );

    var axisShape = new Shape();
    this.addChild( new Path( axisShape, AXIS_OPTIONS ) );

    // add X-axis
    axisShape.moveTo( graphViewBounds.minX, graphViewBounds.centerY );
    axisShape.lineTo( graphViewBounds.maxX, graphViewBounds.centerY );

    // add ticks
    axisShape.moveTo( graphViewBounds.minX + AXIS_OPTIONS.lineWidth / 2, graphViewBounds.centerY - TICK_LENGTH );
    axisShape.lineTo( graphViewBounds.minX + AXIS_OPTIONS.lineWidth / 2, graphViewBounds.centerY + TICK_LENGTH );
    axisShape.moveTo( graphViewBounds.minX + graphViewBounds.width / 4, graphViewBounds.centerY - TICK_LENGTH );
    axisShape.lineTo( graphViewBounds.minX + graphViewBounds.width / 4, graphViewBounds.centerY + TICK_LENGTH );
    axisShape.moveTo( graphViewBounds.minX + 3 * graphViewBounds.width / 4, graphViewBounds.centerY - TICK_LENGTH );
    axisShape.lineTo( graphViewBounds.minX + 3 * graphViewBounds.width / 4, graphViewBounds.centerY + TICK_LENGTH );
    axisShape.moveTo( graphViewBounds.maxX - AXIS_OPTIONS.lineWidth / 2, graphViewBounds.centerY - TICK_LENGTH );
    axisShape.lineTo( graphViewBounds.maxX - AXIS_OPTIONS.lineWidth / 2, graphViewBounds.centerY + TICK_LENGTH );

    // add Y-axis and ticks
    axisShape.moveTo( graphViewBounds.centerX, graphViewBounds.minY );
    axisShape.lineTo( graphViewBounds.centerX, graphViewBounds.maxY );

    axisShape.moveTo( graphViewBounds.centerX - TICK_LENGTH, graphViewBounds.minY + AXIS_OPTIONS.lineWidth / 2 );
    axisShape.lineTo( graphViewBounds.centerX + TICK_LENGTH, graphViewBounds.minY + AXIS_OPTIONS.lineWidth / 2 );
    axisShape.moveTo( graphViewBounds.centerX - TICK_LENGTH, graphViewBounds.height / 4 );
    axisShape.lineTo( graphViewBounds.centerX + TICK_LENGTH, graphViewBounds.height / 4 );
    axisShape.moveTo( graphViewBounds.centerX - TICK_LENGTH, 3 * graphViewBounds.height / 4 );
    axisShape.lineTo( graphViewBounds.centerX + TICK_LENGTH, 3 * graphViewBounds.height / 4 );
    axisShape.moveTo( graphViewBounds.centerX - TICK_LENGTH, graphViewBounds.maxY - AXIS_OPTIONS.lineWidth / 2 );
    axisShape.lineTo( graphViewBounds.centerX + TICK_LENGTH, graphViewBounds.maxY - AXIS_OPTIONS.lineWidth / 2 );

    // add clip area
    this.clipArea = Shape.bounds( graphViewBounds );

    var curvePath = new Path( null, { stroke: 'black', lineWidth: 2 } );
    this.addChild( curvePath );

    var residualsPath = new Path( null, { stroke: CurveFittingConstants.GRAY_COLOR, lineWidth: 2 } );
    this.addChild( residualsPath );

    /**
     * updates the shape of the curve and the residuals
     */
    var updateShape = function() {
      var curveShape = null;
      var residualsShape = null;
      var order = orderProperty.value;
      var xMin = graphModelBounds.minX;
      var xMax = graphModelBounds.maxX;
      var points = curve.getPoints();
      var a = curve.a;
      var b = curve.b;
      var c = curve.c;
      var d = curve.d;
      var x;

      //TODO curve._fitProperty is private!!
      //TODO this expression looks suspect, or at least overly complicated
      if ( ( points.length > 1 || curve._fitProperty.value === Fit.ADJUSTABLE ) && !isNaN( a ) && !isNaN( b ) && !isNaN( c ) && !isNaN( d ) ) {

        // update curve path
        curveShape = new Shape();
        curveShape.moveTo( xMin, curve.getYValueAt( xMin ) );
        if ( order === 1 ) {
          curveShape.lineTo( xMax, curve.getYValueAt( xMax ) );
        }
        else {
          for ( x = xMin; x < xMax; x += PLOT_STEP ) {
            curveShape.lineTo( x, curve.getYValueAt( x ) );
          }
          // we want to make sure to end on xMax, irrespective of the value of PLOT_STEP
          curveShape.lineTo( xMax, curve.getYValueAt( xMax ) );
        }

        // update path residuals
        if ( areResidualsVisibleProperty.value ) {
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

    curve.isVisibleProperty.linkAttribute( curvePath, 'visible' );
    orderProperty.lazyLink( updateShape );
    areResidualsVisibleProperty.link( updateShape );
    curve.updateCurveEmitter.addListener( updateShape );
  }

  curveFitting.register( 'GraphAreaNode', GraphAreaNode );

  return inherit( Node, GraphAreaNode );
} );