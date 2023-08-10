#pragma once
#include <cglm/struct/vec2.h>
#include <cglm/struct/vec3.h>

typedef struct {
    size_t num_vertices;
    size_t num_indices;
    union {
        void* buffer;
        vec3s* positions;
    };
    vec2s* tex_coords;
    vec3s* normals;
    uint32_t* indices;
} mesh_t;

typedef union {
    size_t error;
    mesh_t mesh;
} load_mesh_t;

load_mesh_t load_obj_mesh(const char* path);