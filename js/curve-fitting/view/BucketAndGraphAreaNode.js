// Copyright 2015, University of Colorado Boulder

/**
 * Bucket node and graph area node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var BucketNode = require( 'CURVE_FITTING/curve-fitting/view/BucketNode' );
  var EquationGraphPanelNode = require( 'CURVE_FITTING/curve-fitting/view/EquationGraphPanelNode' );
  var GraphAreaNode = require( 'CURVE_FITTING/curve-fitting/view/GraphAreaNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Point = require( 'CURVE_FITTING/curve-fitting/model/Point' );
  var PointNode = require( 'CURVE_FITTING/curve-fitting/view/PointNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   * @param {CurveFittingModel} curveFittingModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] for graph node
   * @constructor
   */
  function BucketAndGraphAreaNode( curveFittingModel, modelViewTransform, options ) {

    Node.call( this, options );

    var self = this;

    // create the bucket node
    var bucketNode = new BucketNode( curveFittingModel.bucket, modelViewTransform );

    // create the graph area node - responsible for the rendering of the curves, as well as the axes and background.
    var graphAreaNode = new GraphAreaNode( curveFittingModel.curve, curveFittingModel.orderOfFitProperty, curveFittingModel.areResidualsVisibleProperty, curveFittingModel.graphModelBounds, modelViewTransform );

    // create the equation node (accordion box) in the upper left corner of the graph
    var equationGraphPanelNode = new EquationGraphPanelNode( curveFittingModel.isEquationPanelExpandedProperty, curveFittingModel.curve, curveFittingModel.orderOfFitProperty );

    // create a separate layers for all the points
    var pointsNode = new Node();
    // @private
    this.pointsNode = pointsNode;

    // add the children to the screen graph
    this.addChild( graphAreaNode );
    this.addChild( bucketNode );
    this.addChild( equationGraphPanelNode );
    this.addChild( pointsNode );

    // handle the coming and going of points
    curveFittingModel.curve.points.addItemAddedListener( function( addedPoint ) {
      var pointNode = new PointNode( addedPoint, curveFittingModel.areValuesVisibleProperty, curveFittingModel.areResidualsVisibleProperty, modelViewTransform );
      self.addChild( pointNode );

      curveFittingModel.curve.points.addItemRemovedListener( function removalListener( removedPoint ) {
        if ( removedPoint === addedPoint ) {
          self.removeChild( pointNode );
          pointNode.dispose();
          curveFittingModel.curve.points.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // layout
    equationGraphPanelNode.left = graphAreaNode.left + 10;
    equationGraphPanelNode.top = graphAreaNode.top + 10;

    // add drag handler to the bucketNode
    var point = null;
    bucketNode.addInputListener( new SimpleDragHandler( {

      allowTouchSnag: true,

      start: function( event ) {

        // create point model
        var initialPosition = pointsNode.globalToLocalPoint( event.pointer.point );
        point = new Point( modelViewTransform.viewToModelPosition( initialPosition ) );
        point.userControlled = true;

        //add the point to the curve model
        curveFittingModel.curve.points.add( point );

      },
      translate: function( translationParams ) {
        // move the point
        point.position = point.position.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) );

      },
      end: function() {
        point.userControlled = false;
        point = null;
      }
    } ) );
  }

  curveFitting.register( 'BucketAndGraphAreaNode', BucketAndGraphAreaNode );

  return inherit( Node, BucketAndGraphAreaNode );
} );