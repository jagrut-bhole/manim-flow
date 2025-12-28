"use client";

import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { EditorView } from "@/components/Editor";
import { PreviewView } from "@/components/VideoPreview";

export default function EditorPage() {
  const [prompt, setPrompt] = useState<string>("");

  const [code, setCode] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const [provider, setProvider] = useState<"groq" | "gemini">("groq");

      const generatedCode =
        `from manim import *

class MathVisual(Scene):
    def construct(self):
        # Configuration for the Neural Network
        layer_sizes = [4, 7, 7, 3]
        neuron_radius = 0.18
        layer_spacing = 2.5
        neuron_spacing = 0.6
        
        # Colors
        c_input = BLUE
        c_hidden = TEAL
        c_output = RED
        c_edge = GREY_C
        c_active = YELLOW

        # Container for all layers
        network_group = VGroup()
        layers = []
        
        # 1. Create Neurons
        for i, size in enumerate(layer_sizes):
            layer_group = VGroup()
            
            # Determine color based on layer type
            if i == 0:
                color = c_input
            elif i == len(layer_sizes) - 1:
                color = c_output
            else:
                color = c_hidden
            
            # Create neurons for this layer
            for j in range(size):
                neuron = Circle(
                    radius=neuron_radius,
                    color=color,
                    fill_color=color,
                    fill_opacity=0.5,
                    stroke_width=2
                )
                
                # Position logic: Center the layer vertically
                x_pos = (i - (len(layer_sizes) - 1) / 2) * layer_spacing
                y_pos = (j - (size - 1) / 2) * neuron_spacing
                neuron.move_to([x_pos, y_pos, 0])
                neuron.set_z_index(1) # Keep neurons above lines
                layer_group.add(neuron)
            
            layers.append(layer_group)
            network_group.add(layer_group)

        # 2. Create Edges (Weights)
        edge_groups = []
        all_edges = VGroup()
        
        for i in range(len(layers) - 1):
            current_layer_edges = VGroup()
            layer_curr = layers[i]
            layer_next = layers[i + 1]
            
            for n1 in layer_curr:
                for n2 in layer_next:
                    edge = Line(
                        n1.get_center(),
                        n2.get_center(),
                        stroke_color=c_edge,
                        stroke_width=1,
                        stroke_opacity=0.3
                    )
                    edge.set_z_index(0)
                    current_layer_edges.add(edge)
                    all_edges.add(edge)
            
            edge_groups.append(current_layer_edges)
            network_group.add(current_layer_edges)

        # Center the whole network on screen
        network_group.move_to(ORIGIN)

        # 3. Text Labels
        label_scale = 0.7
        input_label = Text("Input Layer", font_size=24).next_to(layers[0], UP, buff=0.5).set_color(c_input)
        hidden_label = Text("Hidden Layers", font_size=24).next_to(VGroup(layers[1], layers[2]), UP, buff=0.5).set_color(c_hidden)
        output_label = Text("Output Layer", font_size=24).next_to(layers[-1], UP, buff=0.5).set_color(c_output)
        labels = VGroup(input_label, hidden_label, output_label)

        # --- Animations ---

        # Sequence 1: Construction
        self.play(LaggedStart(*[Create(layer) for layer in layers], lag_ratio=0.5, run_time=2))
        self.play(FadeIn(all_edges, lag_ratio=0.1, run_time=1.5))
        self.play(Write(labels))
        self.wait(0.5)

        # Sequence 2: Forward Propagation Simulation
        # Simulate data flowing from input to output multiple times
        for _ in range(2): 
            # 1. Light up Input
            self.play(
                layers[0].animate.set_fill(c_active, opacity=1).set_stroke(c_active, width=4),
                run_time=0.5
            )
            
            # Propagate through layers
            for i in range(len(layers) - 1):
                curr_edges = edge_groups[i]
                next_layer = layers[i+1]
                
                # Animate pulses traveling along lines
                self.play(
                    ShowPassingFlash(
                        curr_edges.copy().set_color(c_active).set_stroke(width=3, opacity=1),
                        time_width=0.5,
                        run_time=1.0,
                        rate_func=linear
                    )
                )
                
                # Reset previous layer (dim it back down)
                if i == 0:
                    self.play(
                        layers[i].animate.set_fill(c_input, opacity=0.5).set_stroke(c_input, width=2),
                        next_layer.animate.set_fill(c_active, opacity=1).set_stroke(c_active, width=4),
                        run_time=0.3
                    )
                else:
                    self.play(
                        layers[i].animate.set_fill(c_hidden, opacity=0.5).set_stroke(c_hidden, width=2),
                        next_layer.animate.set_fill(c_active, opacity=1).set_stroke(c_active, width=4),
                        run_time=0.3
                    )

            # Reset Output layer
            self.play(
                layers[-1].animate.set_fill(c_output, opacity=0.5).set_stroke(c_output, width=2),
                run_time=0.5
            )
            self.wait(0.2)

        # Sequence 3: Focus on a single path (Interpretability visualization)
        self.play(FadeOut(labels))
        
        # Dim everything
        self.play(
            network_group.animate.set_opacity(0.1)
        )

        # Highlight specific path: Neuron 0 (Layer 0) -> Neuron 3 (Layer 1) -> Neuron 2 (Layer 2) -> Neuron 1 (Layer 3)
        path_indices = [0, 3, 2, 1]
        highlight_group = VGroup()
        
        for i in range(len(path_indices)):
            # Highlight Neuron
            n_idx = path_indices[i]
            neuron = layers[i][n_idx]
            
            neuron_highlight = neuron.copy().set_opacity(1).set_color(c_active).set_stroke(width=4)
            highlight_group.add(neuron_highlight)
            
            # Highlight Edge (if not last layer)
            if i < len(path_indices) - 1:
                next_n_idx = path_indices[i+1]
                next_neuron = layers[i+1][next_n_idx]
                line = Line(neuron.get_center(), next_neuron.get_center(), color=c_active, stroke_width=4)
                highlight_group.add(line)

        self.play(Create(highlight_group), run_time=1.5)
        self.wait(1)
        
        # Restore full opacity
        self.play(
            network_group.animate.set_opacity(1),
            FadeOut(highlight_group),
            run_time=1
        )

        self.wait(2)`

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/ai/generate-code", {
        prompt,
        provider,
      });

      if (response.data.success) {
        setCode(response.data.data.code);
        toast.success("Code generated successfully!");
      } else {
        toast.error(response.data.message || "Failed to generate code");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate code");
      console.error("Generate error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex gap-6 mt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden">
      <div className="flex-[0.6] min-h-125">
        <EditorView code={code || generatedCode} />
      </div>
      <div className="flex-[0.4] min-h-125">
        <PreviewView />
      </div>
    </div>
  );
}
