// Copyright 2015, University of Colorado Boulder

/**
 * Main ScreenView node that contains all other nodes.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var BucketAndGraphAreaNode = require( 'CURVE_FITTING/curve-fitting/view/BucketAndGraphAreaNode' );
  var ControlMenuNode = require( 'CURVE_FITTING/curve-fitting/view/ControlMenuNode' );
  var DeviationsPanel = require( 'CURVE_FITTING/curve-fitting/view/DeviationsPanel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );

  // constants
  var PADDING_LEFT_RIGHT = 10;
  var PADDING_TOP_BOTTOM = 25;
  var SIM_BOUNDS = new Bounds2( 0, 0, 768, 504 );

  /**
   * @param {CurveFittingModel} curveFittingModel
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function CurveFittingView( curveFittingModel, modelViewTransform ) {
    ScreenView.call( this, { layoutBounds: SIM_BOUNDS } );

    // create deviations node
    var deviationsPanel = new DeviationsPanel( curveFittingModel.isDeviationPanelExpandedProperty, curveFittingModel.curve );

    // create control menu node
    var controlMenuNode = new ControlMenuNode( curveFittingModel );

    // create bucket and graph area node
    var graphAreaWidth = SIM_BOUNDS.width - deviationsPanel.width - controlMenuNode.width - 50;
    curveFittingModel.graphArea.bounds.setMinMax( deviationsPanel.right + 15, PADDING_TOP_BOTTOM, deviationsPanel.right + 15 + graphAreaWidth, graphAreaWidth + PADDING_TOP_BOTTOM );
    curveFittingModel.bucket.position.setXY( deviationsPanel.centerX, SIM_BOUNDS.height - PADDING_TOP_BOTTOM - curveFittingModel.bucket.size.height );
    var bucketAndGraphAreaNode = new BucketAndGraphAreaNode( curveFittingModel, modelViewTransform );

    // create reset all button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        curveFittingModel.reset();
      }
    } );

    this.addChild( deviationsPanel );
    this.addChild( controlMenuNode );
    this.addChild( bucketAndGraphAreaNode );
    this.addChild( resetAllButton );

    deviationsPanel.left =  PADDING_LEFT_RIGHT;
    deviationsPanel.top =  PADDING_TOP_BOTTOM;
    controlMenuNode.right= SIM_BOUNDS.width - PADDING_LEFT_RIGHT ;
    controlMenuNode.top = PADDING_TOP_BOTTOM;
    resetAllButton.scale( 0.75 );
    resetAllButton.right = controlMenuNode.right;
    resetAllButton.bottom = SIM_BOUNDS.height  - PADDING_TOP_BOTTOM;

  }

  curveFitting.register( 'CurveFittingView', CurveFittingView );

  return inherit( ScreenView, CurveFittingView );
} );