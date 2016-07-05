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

    // create the bucket node
    var bucketNode = new BucketNode( curveFittingModel.bucket, modelViewTransform );

    // create the graph area node - responsible for the rendering of the curves, as well as the axes and background.
    var graphAreaNode = new GraphAreaNode( curveFittingModel.curve, curveFittingModel.orderOfFitProperty, curveFittingModel.areResidualsVisibleProperty, curveFittingModel.graphModelBounds, modelViewTransform );

    // create the equation node (accordion box) in the upper left corner of the graph
    var equationGraphPanelNode = new EquationGraphPanelNode( curveFittingModel.isEquationPanelExpandedProperty, curveFittingModel.curve, curveFittingModel.orderOfFitProperty );

    // create a separate layers for all the points
    var pointsNode = new Node();

    // add the children to the screen graph
    this.addChild( graphAreaNode );
    this.addChild( bucketNode );
    this.addChild( equationGraphPanelNode );
    this.addChild( pointsNode );

    // layout
    equationGraphPanelNode.left = graphAreaNode.left + 10;
    equationGraphPanelNode.top = graphAreaNode.top + 10;

    // add drag handler to the bucketNode
    var pointModel = null;
    var pointView = null;
    bucketNode.addInputListener( new SimpleDragHandler( {
      start: function( e ) {
        // create point model
        pointModel = new Point();
        curveFittingModel.curve.points.add( pointModel );

        // create point view
        pointView = new PointNode( pointModel, curveFittingModel.curve.points, curveFittingModel.areValuesVisibleProperty, curveFittingModel.areResidualsVisibleProperty, pointsNode, graphAreaNode );

        // add point node to view
        pointsNode.addChild( pointView );

        // add listeners for the points created
        curveFittingModel.curve.points.addItemAddedListener( function( point ) {

          // removes points from view and point listeners are removed
          curveFittingModel.curve.points.addItemRemovedListener( function removalListener( removedPoint ) {
            if ( removedPoint === point ) {
              pointsNode.removeChild( pointView );
              curveFittingModel.curve.points.removeItemRemovedListener( removalListener );
            }
          } );
        } );

        // update point position
        pointView.setTranslation( pointsNode.globalToLocalPoint( e.pointer.point ) );
        pointModel.trigger( 'updatePosition' );
      },
      drag: function( e ) {
        if ( pointModel ) {
          // update point position
          pointView.setTranslation( pointsNode.globalToLocalPoint( e.pointer.point ) );
          pointModel.trigger( 'updatePosition' );
        }
      },
      end: function() {
        if ( !pointModel.isInsideGraph ) {
          // remove point model and view
          pointsNode.removeChild( pointView );
          curveFittingModel.curve.points.remove( pointModel );
        }
        else {
          // round point position
          pointModel.trigger( 'roundPosition' );
        }

        pointModel = null;
      }
    } ) );
  }

  curveFitting.register( 'BucketAndGraphAreaNode', BucketAndGraphAreaNode );

  return inherit( Node, BucketAndGraphAreaNode );
} );