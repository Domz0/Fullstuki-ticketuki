package com.ticketuki.common.audit;
import java.lang.annotation.*;
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditar {
    String entidad();
    String accion();
    String id() default "";
    int argumento() default 0;
    String condicion() default "";
}
