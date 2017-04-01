// Copyright 2015-2016, University of Colorado Boulder

/**
 * Point model in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function Point( options ) {

    options = _.extend( {
      position: new Vector2( 0, 0 ), // {Vector2} initial position
      dragging: false // {boolean} is the user dragging the point?
    }, options );

    var self = this;
    // @public {Property.<Vector2>} position of point
    this.positionProperty = new Property( options.position );

    // @public (read-only) {Property.<boolean>}  is the point inside the graph? (points outside the graph ares are not used for curve fitting purposes)
    this.isInsideGraphProperty = new BooleanProperty( false );

    // @public {Property.<boolean>}
    this.draggingProperty = new BooleanProperty( options.dragging ); // {boolean} is the user dragging the point?

    // @public {Property.<number>} vertical uncertainty of the point.
    this.deltaProperty = new NumberProperty( 0.8 );

    // @private {boolean} is the point animated by external means (say TWEEN). Animated points are not used for curve fits
    this.animated = false;

    // check and set the flag that indicates if the point is within the bounds of the graph
    this.positionProperty.link( function( position ) {
      // Determines if the position of a point is within the visual bounds of the graph and is not animated on its way back
      self.isInsideGraphProperty.set( CurveFittingConstants.GRAPH_MODEL_BOUNDS.containsPoint( position ) );
    } );

    //if the user dropped the point outside of the graph send it back to the bucket
    this.draggingProperty.lazyLink( function( dragging ) {
      if ( !dragging && !self.isInsideGraphProperty.value && !self.animated ) {
        self.animate();
      }
    } );

    // create emitter that will signal that the point has returned to the bucket
    this.returnToOriginEmitter = new Emitter();
  }

  curveFitting.register( 'Point', Point );

  return inherit( Object, Point, {

    /**
     * Animates the point back to its original position (inside the bucket).
     *
     * @public
     */
    animate: function() {

      var self = this;
      this.animated = true;

      var location = {
        x: this.positionProperty.value.x,
        y: this.positionProperty.value.y
      };

      // distance to the origin
      var distance = this.positionProperty.initialValue.distance( this.positionProperty.value );

      if ( distance > 0 ) {
        var animationTween = new TWEEN.Tween( location )
          .to( { x: this.positionProperty.initialValue.x, y: this.positionProperty.initialValue.y },
            distance / CurveFittingConstants.ANIMATION_SPEED )
          .easing( TWEEN.Easing.Cubic.In )
          .onUpdate( function() {
            self.positionProperty.set( new Vector2( location.x, location.y ) );
          } )
          .onComplete( function() {
            self.animated = false;
            self.returnToOriginEmitter.emit();
          } );

        animationTween.start( phet.joist.elapsedTime );
      }
    }
  } );
} );