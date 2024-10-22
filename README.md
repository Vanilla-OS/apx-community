<div align="center">
  <img src="https://apx.vanillaos.org/assets/logo.svg" height="120">
  <h1 align="center">Apx Community</h1>
  <p align="center">Share your Apx stacks and package managers with the community</p>
</div>

## What is Apx?

Apx is a tool for developers and creators, designed for Vanilla OS but can be used on any Linux distribution. It allows you to create Linux subsystems based on any distributions. Subsystems are created using a stack file, which is a simple YAML file that describes the base distribution, the package manager, and the packages to install.

Apx is built on top of [Distrobox](https://github.com/89luca89/distrobox).

## How to use Apx?

Please read more about Apx on the [official website](https://apx.vanillaos.org).

## What are stacks and package managers?

Stacks are YAML files that describe the base distribution, the package manager, and the packages to install. Package managers are also YAML files that hold the package manager configuration to use in Apx.

Example of a stack file:

```yaml
name: my-go
base: ghcr.io/vanilla-os/pico:main
packages: 
    - golang
pkgmanager: apt
```

Example of a package manager file:

```yaml
name: apt
model: 2
needsudo: true
cmdautoremove: apt autoremove
cmdclean: apt clean
cmdinstall: apt install
cmdlist: apt list
cmdpurge: apt purge
cmdremove: apt remove
cmdsearch: apt search
cmdshow: apt show
cmdupdate: apt update
cmdupgrade: apt upgrade
```

note the `model` field in the package manager file, it is used to determine the syntax to use in the file. Currently the model 1 is deprecated and model 2 is the only one supported so just follow the example above.

## How to contribute?

You can contribute by creating a pull request with your stack and/or package manager files and place them in the correct directory, for example, if you have a stack file for a Go development environment, you can place it in the `stacks/<distribution>` directory and the file should be named like the `name` field in the stack file:

```
stacks/
    vanilla-os/
        my-go.yaml
```

The distribution name should be the same as the base distribution in the stack file, if the folder does not exist, you can create it. The format for the distribution folder name should be the same as the official distribution name, lowercase and with dashes instead of spaces (e.g. `vanilla-os`, `arch-linux`, `fedora`, etc).

If you have a package manager file, you can place it in the `pkgmanagers` directory and the file should be named like the `name` field in the package manager file:

```
pkgmanagers/
    apt.yaml
```

### What stacks and package managers are accepted?

We accept any stack and package manager files that are not harmful to the user's system. We will review the files before merging them into the repository.

### How do I know which package manager to use?

The package manager must be available inside the `base` image. If your image has a specific package manager that is not available in this repo already, you should provide its configuration in a package manager file in the same way as the example above.

### How many packages can I include in a stack?

You can include as many packages as you want, but keep in mind that the more packages you include, the longer it will take to install them. A better choice would be to create your custom OCI image and publish it on a registry like GitHub Container Registry or Docker Hub. Then you can use that image as the base in your stack file.
