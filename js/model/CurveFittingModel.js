// Copyright 2002-2014, University of Colorado Boulder

/**
 * Main Model container.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  var PropertySet = require( 'AXON/PropertySet' );
  var inherit = require( 'PHET_CORE/inherit' );

  function CurveFittingModel() {
    PropertySet.call( this, {} );
  }

  return inherit( PropertySet, CurveFittingModel, {
    reset: function() {
      PropertySet.prototype.reset.call( this );
    }
  } );
} );
