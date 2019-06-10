// Copyright 2015-2019, University of Colorado Boulder

/**
 * Point model in 'Curve Fitting' simulation.
 * TODO: a lot of the logic here regarding the state/existence of animations can probably simplified a lot
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( require => {
  'use strict';

  // modules
  const Animation = require( 'TWIXT/Animation' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const Easing = require( 'TWIXT/Easing' );
  const Emitter = require( 'AXON/Emitter' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  class Point {

    /**
     * @param {Object} [options]
     */
    constructor( options ) {

      options = _.extend( {
        position: new Vector2( 0, 0 ), // {Vector2} initial position
        dragging: false // {boolean} is the user dragging the point?
      }, options );

      // @public {Property.<Vector2>} position of point
      this.positionProperty = new Vector2Property( options.position );

      // @public (read-only) {Property.<boolean>} is the point inside the graph? (points outside the graph ares are not used for curve fitting purposes)
      this.isInsideGraphProperty = new BooleanProperty( false );

      // @public {Property.<boolean>}
      this.draggingProperty = new BooleanProperty( options.dragging ); // {boolean} is the user dragging the point?

      // @public {Property.<number>} vertical uncertainty of the point.
      this.deltaProperty = new NumberProperty( 0.8 );

      // @private {boolean} is the point animated by external means (say TWEEN). Animated points are not used for curve fits
      this.animated = false;

      // @private {TWEEN.Tween|null} the animation of this point; is null if there is no animation
      this.animation = null;

      // check and set the flag that indicates if the point is within the bounds of the graph
      this.positionProperty.link( position => {
        // Determines if the position of a point is within the visual bounds of the graph and is not animated on its way back
        this.isInsideGraphProperty.value = CurveFittingConstants.GRAPH_MODEL_BOUNDS.containsPoint( position );
      } );

      //if the user dropped the point outside of the graph send it back to the bucket
      this.draggingProperty.link( dragging => {
        if ( !dragging && !this.isInsideGraphProperty.value && !this.animated ) {
          this.animate();
        }
        if ( dragging && this.animated ) {
          this.animation.stop();
          this.animation = null;
          this.animated = false;
        }
      } );

      // create emitter that will signal that the point has returned to the bucket
      this.returnToOriginEmitter = new Emitter();
    }

    /**
     * Animates the point back to its original position (inside the bucket).
     *
     * @public
     */
    animate() {

      this.animated = true;

      // distance to the origin
      const distance = this.positionProperty.initialValue.distance( this.positionProperty.value );

      if ( distance > 0 ) {
        this.animation = new Animation( {
          property: this.positionProperty,
          to: this.positionProperty.initialValue,
          duration: distance / CurveFittingConstants.ANIMATION_SPEED,
          easing: Easing.CUBIC_IN
        } );
        this.animation.endedEmitter.addListener( () => {
          this.animated = false;
          this.returnToOriginEmitter.emit();
        } );
        this.animation.start();
      }
      else {
        // for cases where the distance is zero
        this.animated = false;
        this.returnToOriginEmitter.emit();
      }
    }

  }

  curveFitting.register( 'Point', Point );

  return Point;
} );