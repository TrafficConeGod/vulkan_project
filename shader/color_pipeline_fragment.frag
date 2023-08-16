#version 450

layout(push_constant, std430) uniform push_constants_t {
    mat4 model_view_projection;
    vec3 camera_position;
};

layout(binding = 1) uniform sampler2D color_sampler;
layout(binding = 2) uniform sampler2D normal_sampler;
layout(binding = 3) uniform sampler2D shadow_sampler;

layout(location = 0) in vec2 frag_tex_coord;

// All in normal texture space
layout(location = 1) in vec3 frag_vertex_to_camera_direction;
layout(location = 2) in vec3 frag_light_direction;
layout(location = 3) in vec3 frag_position_to_light_direction;
layout(location = 4) in vec4 frag_shadow_clip_position;

layout(location = 0) out vec4 color;

vec3 ambient_base_color = vec3(0.2);
vec3 diffuse_base_color = vec3(1.2);
vec3 specular_base_color = vec3(0.3);
float specular_intensity = 5.0;

float get_shadow_factor() {
	vec3 shadow_norm_device_coord = frag_shadow_clip_position.xyz / frag_shadow_clip_position.w;
	if (
		abs(shadow_norm_device_coord.x) > 1.0 ||
		abs(shadow_norm_device_coord.y) > 1.0 ||
		abs(shadow_norm_device_coord.z) > 1.0
	) { return 0.0; }
	vec2 shadow_tex_coord = (0.5 * shadow_norm_device_coord.xy) + vec2(0.5);
	if (shadow_norm_device_coord.z > texture(shadow_sampler, shadow_tex_coord.xy).x) {
		return 0.0;
	}
	return 1.0;
}

void main() {
	vec3 base_color = texture(color_sampler, frag_tex_coord).rgb;
	vec3 ambient_color = ambient_base_color * base_color;

	// All of this is done with normal texture (aka inverse normal space) space vectors
	vec3 normal = normalize(2.0 * (texture(normal_sampler, frag_tex_coord).xyz - vec3(0.5)));
	float cos_normal_to_position_to_light = clamp(dot(normal, frag_position_to_light_direction), 0.0, 1.0);
	vec3 diffuse_color = get_shadow_factor() * cos_normal_to_position_to_light * base_color * diffuse_base_color;

	vec3 specular_color = vec3(0);
	if (cos_normal_to_position_to_light >= 0) {
		vec3 reflection_direction = reflect(frag_light_direction, normal);
		float specular_factor = clamp(dot(reflection_direction, normalize(frag_vertex_to_camera_direction)), 0.0, 1.0);
		specular_color = specular_base_color * pow(specular_factor, specular_intensity);
	}

    color = vec4(ambient_color + diffuse_color + specular_color, 1.0);
}