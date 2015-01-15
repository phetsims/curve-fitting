//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Main ScreenView node that contains all other nodes.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );

  /**
   * @param {CurveFittingModel} CurveFittingModel
   * @constructor
   */
  function CurveFittingView( CurveFittingModel ) {
    ScreenView.call( this, {renderer: 'svg', layoutBounds: new Bounds2( 0, 0, 768, 504 )} );
  }

  return inherit( ScreenView, CurveFittingView );
} );