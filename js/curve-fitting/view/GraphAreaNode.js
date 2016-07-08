// Copyright 2015, University of Colorado Boulder

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
  var FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
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
   * @param {Curve} curve model.
   * @param {Property.<number>} orderOfFitProperty - Property with current order of fit.
   * @param {Property.<boolean>} areResidualsVisibleProperty - Property to track residuals visibility.
   * @param {Bounds2} graphModelBounds -  bounds of the graph
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function GraphAreaNode( curve, orderOfFitProperty, areResidualsVisibleProperty, graphModelBounds, modelViewTransform, options ) {


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

    var updateShape = function() {
      var curveShape = null;
      var residualsShape = null;
      var orderOfFit = orderOfFitProperty.value;
      var xMin = graphModelBounds.minX;
      var xMax = graphModelBounds.maxX;
      var points = curve.getPoints();
      var a = curve.a;
      var b = curve.b;
      var c = curve.c;
      var d = curve.d;
      var x;

      if ( ( points.length > 1 || curve._fitTypeProperty.value === FitType.ADJUSTABLE ) && !isNaN( a ) && !isNaN( b ) && !isNaN( c ) && !isNaN( d ) ) {
        curveShape = new Shape();
        //update curve view
        if ( orderOfFit === 1 ) {
          curveShape.moveTo( xMin, c * xMin + d );
          curveShape.lineTo( xMax, c * xMax + d );
          curvePath.setShape( modelViewTransform.modelToViewShape( curveShape ) );
        }
        else {
          for ( x = xMin; x < xMax; x += PLOT_STEP ) {
            curveShape.moveTo( x, a * Math.pow( x, 3 ) + b * Math.pow( x, 2 ) + c * x + d );
            curveShape.lineTo( x + PLOT_STEP, a * Math.pow( x + PLOT_STEP, 3 ) + b * Math.pow( x + PLOT_STEP, 2 ) + c * ( x + PLOT_STEP ) + d );
          }
          curvePath.setShape( modelViewTransform.modelToViewShape( curveShape ) );
        }
        // update residuals
        if ( areResidualsVisibleProperty.value ) {
          residualsShape = new Shape();

          points.forEach( function( point ) {
            if ( orderOfFit ) {
              residualsShape.moveToPoint( point.position );
              residualsShape.verticalLineTo( a * Math.pow( point.position.x, 3 ) + b * Math.pow( point.position.x, 2 ) + c * point.position.x + d );
            }
          } );
          residualsPath.setShape( modelViewTransform.modelToViewShape( residualsShape ) );
        }
      }
    };

    curve.isVisibleProperty.linkAttribute( curvePath, 'visible' );
    orderOfFitProperty.lazyLink( updateShape );
    areResidualsVisibleProperty.link( updateShape );
    curve.on( 'update', updateShape );
  }

  curveFitting.register( 'GraphAreaNode', GraphAreaNode );

  return inherit( Node, GraphAreaNode );
} );