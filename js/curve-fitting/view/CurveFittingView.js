// Copyright 2002-2014, University of Colorado Boulder

/**
 * Main ScreenView node that contains all other nodes.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var BucketAndGraphAreaNode = require( 'CURVE_FITTING/curve-fitting/view/BucketAndGraphAreaNode' );
  var ControlMenuNode = require( 'CURVE_FITTING/curve-fitting/view/ControlMenuNode' );
  var DeviationsNode = require( 'CURVE_FITTING/curve-fitting/view/DeviationsNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );

  // constants
  var PADDING_LEFT_RIGHT = 10;
  var PADDING_TOP_BOTTOM = 25;
  var SIM_BOUNDS = new Bounds2( 0, 0, 768, 504 );

  /**
   * @param {CurveFittingModel} CurveFittingModel
   * @constructor
   */
  function CurveFittingView( CurveFittingModel ) {
    ScreenView.call( this, { layoutBounds: SIM_BOUNDS } );

    // add deviations node
    var deviationsNode = new DeviationsNode( CurveFittingModel.isDeviationPanelExpandedProperty, CurveFittingModel.curve.chiSquareProperty, CurveFittingModel.curve.chiFillProperty, CurveFittingModel.curve.rSquareProperty );
    deviationsNode.centerX = deviationsNode.width / 2 + PADDING_LEFT_RIGHT;
    deviationsNode.centerY = deviationsNode.height / 2 + PADDING_TOP_BOTTOM;
    this.addChild( deviationsNode );

    // add control menu node
    var controlMenuNode = new ControlMenuNode( CurveFittingModel );
    controlMenuNode.centerX = SIM_BOUNDS.width - PADDING_LEFT_RIGHT - controlMenuNode.width / 2;
    controlMenuNode.centerY = PADDING_TOP_BOTTOM + controlMenuNode.height / 2;
    this.addChild( controlMenuNode );

    // add bucket adn graph area node
    var bucketAndGraphAreaNode = new BucketAndGraphAreaNode( CurveFittingModel );
    bucketAndGraphAreaNode.centerX = bucketAndGraphAreaNode.width / 2 + PADDING_LEFT_RIGHT + 25;
    bucketAndGraphAreaNode.centerY = bucketAndGraphAreaNode.height / 2 + PADDING_TOP_BOTTOM;
    this.addChild( bucketAndGraphAreaNode );

    // add reset all button
    var resetAllButton = new ResetAllButton( {
      listener: CurveFittingModel.reset.bind( CurveFittingModel )
    } );
    resetAllButton.scale( 0.75 );
    resetAllButton.centerX = SIM_BOUNDS.width - resetAllButton.width / 2 - PADDING_LEFT_RIGHT;
    resetAllButton.centerY = SIM_BOUNDS.height - resetAllButton.height / 2 - PADDING_TOP_BOTTOM;
    this.addChild( resetAllButton );
  }

  return inherit( ScreenView, CurveFittingView );
} );